package db

import (
	"context"
	"testing"

	"serverpanel/backend/internal/models"
)

func TestFTPAccountLifecycle(t *testing.T) {
	store, err := Connect("")
	if err != nil {
		t.Fatalf("Connect() error = %v", err)
	}
	ctx := context.Background()

	created, err := store.CreateFTPAccount(ctx, models.CreateFTPAccountInput{
		Username: "deploybot",
		Password: "SuperSecret123",
		HomeDir:  "/home/example/deploy",
		QuotaMB:  2048,
	})
	if err != nil {
		t.Fatalf("CreateFTPAccount() error = %v", err)
	}
	if created.Username != "deploybot" {
		t.Fatalf("expected username deploybot, got %s", created.Username)
	}

	enabled := false
	updated, err := store.UpdateFTPAccount(ctx, "deploybot", models.UpdateFTPAccountInput{Enabled: &enabled, QuotaMB: 4096})
	if err != nil {
		t.Fatalf("UpdateFTPAccount() error = %v", err)
	}
	if updated.Enabled {
		t.Fatal("expected account to be disabled")
	}
	if updated.QuotaMB != 4096 {
		t.Fatalf("expected quota 4096, got %d", updated.QuotaMB)
	}

	rotated, err := store.UpdateFTPPassword(ctx, "deploybot", models.UpdateFTPPasswordInput{Password: "EvenMoreSecret123"})
	if err != nil {
		t.Fatalf("UpdateFTPPassword() error = %v", err)
	}
	if rotated.LastPasswordSync == "" {
		t.Fatal("expected LastPasswordSync to be populated")
	}

	if err := store.DeleteFTPAccount(ctx, "deploybot"); err != nil {
		t.Fatalf("DeleteFTPAccount() error = %v", err)
	}

	accounts, err := store.ListFTPAccounts(ctx)
	if err != nil {
		t.Fatalf("ListFTPAccounts() error = %v", err)
	}
	for _, account := range accounts {
		if account.Username == "deploybot" {
			t.Fatal("deleted account still present")
		}
	}
}
