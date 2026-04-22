package data

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"

	"github.com/ball6847/modelsdb/internal/models"
)

type AppData struct {
	Models []models.Model
}

func Load(path string) (*AppData, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read %s: %w", path, err)
	}

	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("failed to parse api.json: %w", err)
	}

	var allModels []models.Model
	for providerID, providerData := range raw {
		var provider struct {
			Models map[string]models.Model `json:"models"`
		}
		if err := json.Unmarshal(providerData, &provider); err != nil {
			continue
		}
		for _, m := range provider.Models {
			m.ProviderID = providerID
			allModels = append(allModels, m)
		}
	}

	return &AppData{Models: allModels}, nil
}

func (a *AppData) Filter(query string) []models.Model {
	if query == "" {
		return a.Models
	}
	q := strings.ToLower(query)
	var result []models.Model
	for _, m := range a.Models {
		if strings.Contains(strings.ToLower(m.Name), q) ||
			strings.Contains(strings.ToLower(m.ID), q) ||
			strings.Contains(strings.ToLower(m.ProviderID), q) ||
			(m.Family != nil && strings.Contains(strings.ToLower(*m.Family), q)) {
			result = append(result, m)
		}
	}
	return result
}

func (a *AppData) Sort(items []models.Model, sortBy models.SortField, dir models.SortDir) []models.Model {
	sorted := make([]models.Model, len(items))
	copy(sorted, items)

	sort.SliceStable(sorted, func(i, j int) bool {
		var vi, vj float64
		var ni, nj bool

		switch sortBy {
		case models.SortName:
			return sortDirLess(sorted[i].Name < sorted[j].Name, dir)
		case models.SortProvider:
			return sortDirLess(sorted[i].ProviderID < sorted[j].ProviderID, dir)
		case models.SortContext:
			ni, nj = sorted[i].Limit == nil, sorted[j].Limit == nil
			if !ni {
				vi = float64(sorted[i].Limit.Context)
			}
			if !nj {
				vj = float64(sorted[j].Limit.Context)
			}
		case models.SortInputCost:
			ni, nj = sorted[i].Cost == nil, sorted[j].Cost == nil
			if !ni {
				vi = sorted[i].Cost.Input
			}
			if !nj {
				vj = sorted[j].Cost.Input
			}
		case models.SortOutputCost:
			ni, nj = sorted[i].Cost == nil, sorted[j].Cost == nil
			if !ni {
				vi = sorted[i].Cost.Output
			}
			if !nj {
				vj = sorted[j].Cost.Output
			}
		default:
			return sortDirLess(sorted[i].Name < sorted[j].Name, dir)
		}

		return sortDirLessWithNil(vi, vj, ni, nj, dir)
	})

	return sorted
}

func sortDirLess(less bool, dir models.SortDir) bool {
	if dir == models.SortDesc {
		return !less
	}
	return less
}

func sortDirLessWithNil(vi, vj float64, ni, nj bool, dir models.SortDir) bool {
	if ni && nj {
		return false
	}
	if ni {
		return false // i is nil → goes to end
	}
	if nj {
		return true // j is nil → i comes first
	}
	if dir == models.SortDesc {
		return vi > vj
	}
	return vi < vj
}

func (a *AppData) Find(providerID, modelID string) (*models.Model, error) {
	for _, m := range a.Models {
		if m.ProviderID == providerID && m.ID == modelID {
			return &m, nil
		}
	}
	return nil, fmt.Errorf("model not found: %s/%s", providerID, modelID)
}

func Paginate(items []models.Model, offset, limit int) []models.Model {
	if offset >= len(items) {
		return []models.Model{}
	}
	end := offset + limit
	if end > len(items) {
		end = len(items)
	}
	return items[offset:end]
}
