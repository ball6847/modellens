package models

type Model struct {
	ProviderID  string      `json:"provider_id"`
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Family      *string     `json:"family"`
	Attachment  *bool       `json:"attachment"`
	Reasoning   *bool       `json:"reasoning"`
	ToolCall    *bool       `json:"tool_call"`
	Temperature *bool       `json:"temperature"`
	Knowledge   *string     `json:"knowledge"`
	ReleaseDate *string     `json:"release_date"`
	LastUpdated *string     `json:"last_updated"`
	Modalities  *Modalities `json:"modalities"`
	OpenWeights *bool       `json:"open_weights"`
	Cost        *Cost       `json:"cost"`
	Limit       *ModelLimit `json:"limit"`
}

type Modalities struct {
	Input  []string `json:"input"`
	Output []string `json:"output"`
}

type Cost struct {
	Input  float64 `json:"input"`
	Output float64 `json:"output"`
}

type ModelLimit struct {
	Context int `json:"context"`
	Output  int `json:"output"`
}

type ModelPage struct {
	Models []Model `json:"models"`
	Total  int     `json:"total"`
}

type SortField string

const (
	SortProvider   SortField = "provider"
	SortName       SortField = "name"
	SortContext    SortField = "context"
	SortInputCost  SortField = "input_cost"
	SortOutputCost SortField = "output_cost"
)

type SortDir string

const (
	SortAsc  SortDir = "asc"
	SortDesc SortDir = "desc"
)
