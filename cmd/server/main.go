package main

import (
	"fmt"
	"io/fs"
	"net/http"
	"os"

	"github.com/ball6847/modelsdb/internal/api"
	"github.com/ball6847/modelsdb/internal/data"
	"github.com/gin-gonic/gin"
	"github.com/kelseyhightower/envconfig"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
)

type Config struct {
	Port    int    `envconfig:"PORT" default:"3000"`
	APIFile string `envconfig:"API_FILE" default:"api.json"`
}

func main() {
	log.Logger = zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr}).With().Timestamp().Logger()

	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		log.Fatal().Err(err).Msg("failed to parse config")
	}

	rootCmd := &cobra.Command{
		Use:   "modellens",
		Short: "ModelLens - LLM Model Database Browser",
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cfg)
		},
	}

	if err := rootCmd.Execute(); err != nil {
		log.Fatal().Err(err).Msg("failed to execute command")
	}
}

func formatCount(n int) string {
	s := fmt.Sprintf("%d", n)
	if len(s) <= 3 {
		return s
	}
	var result []byte
	for i, c := range []byte(s) {
		if i > 0 && (len(s)-i)%3 == 0 {
			result = append(result, ',')
		}
		result = append(result, c)
	}
	return string(result)
}

func run(cfg Config) error {
	appData, err := data.Load(cfg.APIFile)
	if err != nil {
		return fmt.Errorf("failed to load data: %w", err)
	}

	log.Info().Int("count", len(appData.Models)).Msgf("Loaded %s models from %s", formatCount(len(appData.Models)), cfg.APIFile)

	handler := api.NewHandler(appData)

	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
	r.GET("/api/models", handler.SearchModels)
	r.GET("/api/models/:provider_id/:model_id", handler.GetModelDetail)

	distFS, err := fs.Sub(staticFS, "dist")
	if err != nil {
		return fmt.Errorf("failed to load embedded static files: %w", err)
	}
	fileServer := http.FileServer(http.FS(distFS))
	r.NoRoute(func(c *gin.Context) {
		// Try to serve the file from embedded FS
		path := c.Request.URL.Path
		if path == "/" {
			path = "/index.html"
		}
		f, err := distFS.Open(path[1:])
		if err == nil {
			f.Close()
			fileServer.ServeHTTP(c.Writer, c.Request)
			return
		}
		// SPA fallback: serve index.html for unmatched routes
		c.FileFromFS("/index.html", http.FS(distFS))
	})

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Info().Msgf("Listening on %s", addr)
	return r.Run(addr)
}
