package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ball6847/modelsdb/internal/data"
	"github.com/ball6847/modelsdb/internal/models"
	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func testHandler(t *testing.T) *Handler {
	t.Helper()
	ad, err := data.Load("../data/testdata/fixture.json")
	if err != nil {
		t.Fatalf("failed to load fixture: %v", err)
	}
	return NewHandler(ad)
}

func setupRouter(h *Handler) *gin.Engine {
	r := gin.New()
	r.GET("/api/models", h.SearchModels)
	r.GET("/api/models/:provider_id/:model_id", h.GetModelDetail)
	return r
}

func TestSearchModels(t *testing.T) {
	h := testHandler(t)
	router := setupRouter(h)

	t.Run("empty query returns all models", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/models", nil)
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
		var page models.ModelPage
		json.Unmarshal(w.Body.Bytes(), &page)
		if page.Total != 5 {
			t.Errorf("expected total 5, got %d", page.Total)
		}
	})

	t.Run("query filter works", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/models?query=claude", nil)
		router.ServeHTTP(w, req)

		var page models.ModelPage
		json.Unmarshal(w.Body.Bytes(), &page)
		if page.Total != 2 {
			t.Errorf("expected total 2 for claude, got %d", page.Total)
		}
	})

	t.Run("sort by name ascending", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/models?sort_by=name&sort_dir=asc", nil)
		router.ServeHTTP(w, req)

		var page models.ModelPage
		json.Unmarshal(w.Body.Bytes(), &page)
		for i := 1; i < len(page.Models); i++ {
			if page.Models[i].Name < page.Models[i-1].Name {
				t.Errorf("not sorted at index %d", i)
			}
		}
	})

	t.Run("pagination with offset and limit", func(t *testing.T) {
		w1 := httptest.NewRecorder()
		req1, _ := http.NewRequest("GET", "/api/models?offset=0&limit=2", nil)
		router.ServeHTTP(w1, req1)

		var page1 models.ModelPage
		json.Unmarshal(w1.Body.Bytes(), &page1)
		if len(page1.Models) != 2 {
			t.Errorf("expected 2 models, got %d", len(page1.Models))
		}

		w2 := httptest.NewRecorder()
		req2, _ := http.NewRequest("GET", "/api/models?offset=2&limit=2", nil)
		router.ServeHTTP(w2, req2)

		var page2 models.ModelPage
		json.Unmarshal(w2.Body.Bytes(), &page2)
		if page1.Models[0].ID == page2.Models[0].ID {
			t.Error("different offsets should produce different pages")
		}
	})

	t.Run("limit capped at 100", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/models?limit=500", nil)
		router.ServeHTTP(w, req)

		var page models.ModelPage
		json.Unmarshal(w.Body.Bytes(), &page)
		if len(page.Models) > 100 {
			t.Errorf("limit should be capped at 100, got %d", len(page.Models))
		}
	})

	t.Run("limit zero defaults to 100", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/models?limit=0", nil)
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})

	t.Run("no match returns zero total", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/models?query=zzz_nonexistent", nil)
		router.ServeHTTP(w, req)

		var page models.ModelPage
		json.Unmarshal(w.Body.Bytes(), &page)
		if page.Total != 0 {
			t.Errorf("expected total 0, got %d", page.Total)
		}
	})

	t.Run("combined query sort and pagination", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/models?query=gpt&sort_by=name&sort_dir=asc&offset=0&limit=1", nil)
		router.ServeHTTP(w, req)

		var page models.ModelPage
		json.Unmarshal(w.Body.Bytes(), &page)
		if page.Total != 2 {
			t.Errorf("expected total 2, got %d", page.Total)
		}
		if len(page.Models) != 1 {
			t.Errorf("expected 1 model on page, got %d", len(page.Models))
		}
	})
}

func TestGetModelDetail(t *testing.T) {
	h := testHandler(t)
	router := setupRouter(h)

	tests := []struct {
		name       string
		providerID string
		modelID    string
		wantStatus int
		wantName   string
	}{
		{"existing model", "openai", "gpt-4o", http.StatusOK, "GPT-4o"},
		{"another existing model", "anthropic", "claude-3-opus", http.StatusOK, "Claude 3 Opus"},
		{"missing model", "openai", "nonexistent", http.StatusNotFound, ""},
		{"missing provider", "nonexistent", "gpt-4o", http.StatusNotFound, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			url := fmt.Sprintf("/api/models/%s/%s", tt.providerID, tt.modelID)
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", url, nil)
			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("expected status %d, got %d", tt.wantStatus, w.Code)
			}
			if tt.wantStatus == http.StatusOK {
				var m models.Model
				json.Unmarshal(w.Body.Bytes(), &m)
				if m.Name != tt.wantName {
					t.Errorf("expected name %q, got %q", tt.wantName, m.Name)
				}
			}
		})
	}
}
