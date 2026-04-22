package data

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/ball6847/modelsdb/internal/models"
)

func fixturePath(t *testing.T) string {
	t.Helper()
	return filepath.Join("testdata", "fixture.json")
}

func loadFixture(t *testing.T) *AppData {
	t.Helper()
	ad, err := Load(fixturePath(t))
	if err != nil {
		t.Fatalf("failed to load fixture: %v", err)
	}
	return ad
}

func TestLoad(t *testing.T) {
	t.Run("fixture loads successfully", func(t *testing.T) {
		ad := loadFixture(t)
		if len(ad.Models) != 5 {
			t.Errorf("expected 5 models, got %d", len(ad.Models))
		}
	})

	t.Run("real api.json loads with expected count", func(t *testing.T) {
		// api.json is at project root
		rootPath := filepath.Join("..", "..", "api.json")
		if _, err := os.Stat(rootPath); os.IsNotExist(err) {
			t.Skip("api.json not found at project root")
		}
		ad, err := Load(rootPath)
		if err != nil {
			t.Fatalf("failed to load api.json: %v", err)
		}
		if len(ad.Models) != 4274 {
			t.Errorf("expected 4274 models, got %d", len(ad.Models))
		}
	})

	t.Run("provider_id assigned correctly", func(t *testing.T) {
		ad := loadFixture(t)
		providers := map[string]int{}
		for _, m := range ad.Models {
			if m.ProviderID == "" {
				t.Errorf("model %s has empty provider_id", m.ID)
			}
			providers[m.ProviderID]++
		}
		if providers["openai"] != 3 {
			t.Errorf("expected 3 openai models, got %d", providers["openai"])
		}
		if providers["anthropic"] != 2 {
			t.Errorf("expected 2 anthropic models, got %d", providers["anthropic"])
		}
	})

	t.Run("optional nil fields preserved", func(t *testing.T) {
		ad := loadFixture(t)
		// gpt-4o has family set, o1-mini does not
		var o1mini *models.Model
		for i, m := range ad.Models {
			if m.ID == "o1-mini" {
				o1mini = &ad.Models[i]
				break
			}
		}
		if o1mini == nil {
			t.Fatal("o1-mini not found")
		}
		if o1mini.Family != nil {
			t.Error("expected o1-mini family to be nil")
		}
	})

	t.Run("nonexistent file returns error", func(t *testing.T) {
		_, err := Load("/tmp/nonexistent.json")
		if err == nil {
			t.Error("expected error for missing file")
		}
	})

	t.Run("invalid json returns error", func(t *testing.T) {
		tmp := filepath.Join(t.TempDir(), "bad.json")
		os.WriteFile(tmp, []byte("{invalid}"), 0644)
		_, err := Load(tmp)
		if err == nil {
			t.Error("expected error for invalid json")
		}
	})
}

func TestFilter(t *testing.T) {
	ad := loadFixture(t)

	tests := []struct {
		name     string
		query    string
		minCount int
		maxCount int
		mustHave []string // model IDs that must be in results
	}{
		{"empty query returns all", "", 5, 5, nil},
		{"case insensitive search", "GPT", 2, 2, []string{"gpt-4o", "gpt-4o-mini"}},
		{"lowercase match", "claude", 2, 2, []string{"claude-3-opus", "claude-3-sonnet"}},
		{"match by id substring", "gpt-4o", 2, 2, []string{"gpt-4o", "gpt-4o-mini"}},
		{"match by family", "gpt", 2, 2, []string{"gpt-4o", "gpt-4o-mini"}},
		{"match by provider_id", "openai", 3, 3, []string{"gpt-4o", "gpt-4o-mini", "o1-mini"}},
		{"no match returns empty", "zzz_nonexistent", 0, 0, nil},
		{"match by name only", "Opus", 1, 1, []string{"claude-3-opus"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ad.Filter(tt.query)
			if len(result) < tt.minCount || len(result) > tt.maxCount {
				t.Errorf("query %q: expected count %d-%d, got %d", tt.query, tt.minCount, tt.maxCount, len(result))
			}
			for _, id := range tt.mustHave {
				found := false
				for _, m := range result {
					if m.ID == id {
						found = true
						break
					}
				}
				if !found {
					t.Errorf("query %q: expected model %q in results", tt.query, id)
				}
			}
		})
	}
}

func TestSort(t *testing.T) {
	ad := loadFixture(t)

	t.Run("name ascending", func(t *testing.T) {
		sorted := ad.Sort(ad.Models, models.SortName, models.SortAsc)
		for i := 1; i < len(sorted); i++ {
			if sorted[i].Name < sorted[i-1].Name {
				t.Errorf("not sorted ascending at index %d: %s < %s", i, sorted[i].Name, sorted[i-1].Name)
			}
		}
	})

	t.Run("name descending", func(t *testing.T) {
		sorted := ad.Sort(ad.Models, models.SortName, models.SortDesc)
		for i := 1; i < len(sorted); i++ {
			if sorted[i].Name > sorted[i-1].Name {
				t.Errorf("not sorted descending at index %d: %s > %s", i, sorted[i].Name, sorted[i-1].Name)
			}
		}
	})

	t.Run("context ascending numeric", func(t *testing.T) {
		sorted := ad.Sort(ad.Models, models.SortContext, models.SortAsc)
		for i := 1; i < len(sorted); i++ {
			prev := sorted[i-1].Limit
			curr := sorted[i].Limit
			if prev != nil && curr != nil && curr.Context < prev.Context {
				t.Errorf("not sorted by context at index %d: %d < %d", i, curr.Context, prev.Context)
			}
		}
	})

	t.Run("provider ascending", func(t *testing.T) {
		sorted := ad.Sort(ad.Models, models.SortProvider, models.SortAsc)
		for i := 1; i < len(sorted); i++ {
			if sorted[i].ProviderID < sorted[i-1].ProviderID {
				t.Errorf("not sorted by provider at index %d: %s < %s", i, sorted[i].ProviderID, sorted[i-1].ProviderID)
			}
		}
	})

	t.Run("input_cost with nil cost goes to end", func(t *testing.T) {
		ms := []models.Model{
			{ID: "expensive", Name: "Expensive", Cost: &models.Cost{Input: 10.0, Output: 50.0}},
			{ID: "cheap", Name: "Cheap", Cost: &models.Cost{Input: 0.1, Output: 0.5}},
			{ID: "free", Name: "Free", Cost: nil},
		}
		appData := &AppData{Models: ms}
		sorted := appData.Sort(ms, models.SortInputCost, models.SortAsc)
		if sorted[0].ID != "cheap" {
			t.Errorf("expected cheap first, got %s", sorted[0].ID)
		}
		if sorted[1].ID != "expensive" {
			t.Errorf("expected expensive second, got %s", sorted[1].ID)
		}
		if sorted[2].ID != "free" {
			t.Errorf("expected free (nil cost) last, got %s", sorted[2].ID)
		}
	})

	t.Run("output_cost ascending", func(t *testing.T) {
		ms := []models.Model{
			{ID: "high", Name: "High", Cost: &models.Cost{Input: 1.0, Output: 100.0}},
			{ID: "low", Name: "Low", Cost: &models.Cost{Input: 0.1, Output: 0.5}},
		}
		appData := &AppData{Models: ms}
		sorted := appData.Sort(ms, models.SortOutputCost, models.SortAsc)
		if sorted[0].ID != "low" {
			t.Errorf("expected low first, got %s", sorted[0].ID)
		}
	})

	t.Run("unknown sort field defaults to name", func(t *testing.T) {
		sorted := ad.Sort(ad.Models, "unknown", models.SortAsc)
		for i := 1; i < len(sorted); i++ {
			if sorted[i].Name < sorted[i-1].Name {
				t.Errorf("not sorted by name at index %d", i)
			}
		}
	})

	t.Run("does not modify original slice", func(t *testing.T) {
		original := make([]models.Model, len(ad.Models))
		copy(original, ad.Models)
		ad.Sort(ad.Models, models.SortName, models.SortDesc)
		for i, m := range ad.Models {
			if m.ID != original[i].ID {
				t.Error("original slice was modified")
				break
			}
		}
	})
}

func TestFind(t *testing.T) {
	ad := loadFixture(t)

	t.Run("existing model found", func(t *testing.T) {
		m, err := ad.Find("openai", "gpt-4o")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if m.Name != "GPT-4o" {
			t.Errorf("expected GPT-4o, got %s", m.Name)
		}
	})

	t.Run("missing model returns error", func(t *testing.T) {
		_, err := ad.Find("openai", "nonexistent")
		if err == nil {
			t.Error("expected error for missing model")
		}
	})

	t.Run("wrong provider returns error", func(t *testing.T) {
		_, err := ad.Find("anthropic", "gpt-4o")
		if err == nil {
			t.Error("expected error for wrong provider")
		}
	})
}

func TestPaginate(t *testing.T) {
	ad := loadFixture(t) // 5 models

	tests := []struct {
		name      string
		offset    int
		limit     int
		wantCount int
	}{
		{"first page", 0, 2, 2},
		{"second page", 2, 2, 2},
		{"third page with remainder", 4, 2, 1},
		{"offset beyond end", 10, 10, 0},
		{"limit exceeds remaining", 0, 100, 5},
		{"single item", 0, 1, 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			page := Paginate(ad.Models, tt.offset, tt.limit)
			if len(page) != tt.wantCount {
				t.Errorf("offset=%d limit=%d: expected %d models, got %d", tt.offset, tt.limit, tt.wantCount, len(page))
			}
		})
	}

	t.Run("offset produces different pages", func(t *testing.T) {
		page1 := Paginate(ad.Models, 0, 2)
		page2 := Paginate(ad.Models, 2, 2)
		if page1[0].ID == page2[0].ID {
			t.Error("pages should have different first models")
		}
	})
}
