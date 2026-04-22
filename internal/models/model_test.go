package models

import (
	"encoding/json"
	"testing"
)

func TestModelUnmarshal(t *testing.T) {
	t.Run("full model with all fields", func(t *testing.T) {
		raw := `{
			"provider_id": "openai",
			"id": "gpt-4o",
			"name": "GPT-4o",
			"family": "gpt",
			"attachment": true,
			"reasoning": false,
			"tool_call": true,
			"temperature": true,
			"knowledge": "2024-04",
			"release_date": "2024-05-13",
			"last_updated": "2024-05-13",
			"modalities": {"input": ["text", "image"], "output": ["text"]},
			"open_weights": false,
			"cost": {"input": 2.5, "output": 10.0},
			"limit": {"context": 128000, "output": 16384}
		}`

		var m Model
		if err := json.Unmarshal([]byte(raw), &m); err != nil {
			t.Fatalf("unmarshal failed: %v", err)
		}

		if m.ID != "gpt-4o" {
			t.Errorf("expected id gpt-4o, got %s", m.ID)
		}
		if m.Name != "GPT-4o" {
			t.Errorf("expected name GPT-4o, got %s", m.Name)
		}
		if m.Family == nil || *m.Family != "gpt" {
			t.Error("expected family gpt")
		}
		if m.Cost == nil || m.Cost.Input != 2.5 || m.Cost.Output != 10.0 {
			t.Error("expected cost input=2.5, output=10.0")
		}
		if m.Limit == nil || m.Limit.Context != 128000 || m.Limit.Output != 16384 {
			t.Error("expected context=128000, output=16384")
		}
		if m.Modalities == nil || len(m.Modalities.Input) != 2 {
			t.Error("expected 2 input modalities")
		}
	})

	t.Run("model with nil optional fields", func(t *testing.T) {
		raw := `{
			"id": "basic",
			"name": "Basic Model"
		}`

		var m Model
		if err := json.Unmarshal([]byte(raw), &m); err != nil {
			t.Fatalf("unmarshal failed: %v", err)
		}

		if m.Family != nil {
			t.Error("expected nil family")
		}
		if m.Cost != nil {
			t.Error("expected nil cost")
		}
		if m.Limit != nil {
			t.Error("expected nil limit")
		}
		if m.Modalities != nil {
			t.Error("expected nil modalities")
		}
	})

	t.Run("model page deserialization", func(t *testing.T) {
		raw := `{"models": [{"id":"m1","name":"Model 1"}], "total": 1}`
		var page ModelPage
		if err := json.Unmarshal([]byte(raw), &page); err != nil {
			t.Fatalf("unmarshal failed: %v", err)
		}
		if page.Total != 1 {
			t.Errorf("expected total 1, got %d", page.Total)
		}
		if len(page.Models) != 1 {
			t.Errorf("expected 1 model, got %d", len(page.Models))
		}
	})
}

func TestSortFieldConstants(t *testing.T) {
	tests := []struct {
		field    SortField
		expected string
	}{
		{SortProvider, "provider"},
		{SortName, "name"},
		{SortContext, "context"},
		{SortInputCost, "input_cost"},
		{SortOutputCost, "output_cost"},
	}
	for _, tt := range tests {
		if string(tt.field) != tt.expected {
			t.Errorf("SortField %v: expected %s, got %s", tt.field, tt.expected, string(tt.field))
		}
	}
}

func TestSortDirConstants(t *testing.T) {
	if string(SortAsc) != "asc" {
		t.Errorf("expected asc, got %s", string(SortAsc))
	}
	if string(SortDesc) != "desc" {
		t.Errorf("expected desc, got %s", string(SortDesc))
	}
}
