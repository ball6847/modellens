package data

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/rs/zerolog/log"
)

const DefaultRemoteURL = "https://models.dev/api.json"

func Sync(localPath, remoteURL string) error {
	if remoteURL == "" {
		remoteURL = DefaultRemoteURL
	}

	etagFile := localPath + ".etag"
	localETag, _ := os.ReadFile(etagFile)
	localETagStr := strings.TrimSpace(string(localETag))

	remoteETag, err := getRemoteETag(remoteURL)
	if err != nil {
		if _, statErr := os.Stat(localPath); statErr == nil {
			log.Warn().Err(err).Msg("failed to check remote version, using local file")
			return nil
		}
		return fmt.Errorf("failed to check remote version and no local file: %w", err)
	}

	if _, statErr := os.Stat(localPath); os.IsNotExist(statErr) {
		log.Info().
			Str("remote", remoteURL).
			Str("local", localPath).
			Msg("Local file not found, downloading from remote")
		return downloadFile(localPath, remoteURL, remoteETag)
	}

	if localETagStr != "" && localETagStr == remoteETag {
		log.Info().
			Str("etag", remoteETag).
			Msg("Local file is up to date (ETag match), skipping download")
		return nil
	}

	log.Info().
		Str("remote", remoteURL).
		Str("local_etag", localETagStr).
		Str("remote_etag", remoteETag).
		Msg("Remote file has changed, downloading")
	return downloadFile(localPath, remoteURL, remoteETag)
}

func getRemoteETag(url string) (string, error) {
	resp, err := http.Head(url)
	if err != nil {
		return "", fmt.Errorf("HEAD request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("HEAD request returned status %d", resp.StatusCode)
	}

	etag := resp.Header.Get("ETag")
	if etag == "" {
		return "", fmt.Errorf("ETag header not found")
	}

	return strings.Trim(etag, `"`), nil
}

func downloadFile(localPath, url, etag string) error {
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("GET request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GET request returned status %d", resp.StatusCode)
	}

	if err := os.MkdirAll(filepath.Dir(localPath), 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	file, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(file, resp.Body); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	etagFile := localPath + ".etag"
	if err := os.WriteFile(etagFile, []byte(etag), 0644); err != nil {
		log.Warn().Err(err).Msg("failed to write ETag file")
	}

	return nil
}
