package api

import (
	"net/http"
	"strconv"

	"github.com/ball6847/modelsdb/internal/data"
	"github.com/ball6847/modelsdb/internal/models"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	appData *data.AppData
}

func NewHandler(appData *data.AppData) *Handler {
	return &Handler{appData: appData}
}

func (h *Handler) SearchModels(c *gin.Context) {
	query := c.Query("query")
	sortBy := models.SortField(c.Query("sort_by"))
	sortDir := models.SortDir(c.Query("sort_dir"))
	offset, _ := strconv.Atoi(c.Query("offset"))
	limit, _ := strconv.Atoi(c.Query("limit"))

	if limit > 100 || limit <= 0 {
		limit = 100
	}

	filtered := h.appData.Filter(query)
	sorted := h.appData.Sort(filtered, sortBy, sortDir)
	total := len(sorted)
	page := data.Paginate(sorted, offset, limit)

	c.JSON(http.StatusOK, models.ModelPage{Models: page, Total: total})
}

func (h *Handler) GetModelDetail(c *gin.Context) {
	providerID := c.Param("provider_id")
	modelID := c.Param("model_id")

	model, err := h.appData.Find(providerID, modelID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "model not found"})
		return
	}
	c.JSON(http.StatusOK, model)
}
