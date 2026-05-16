import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ItemCard from "../ItemCard";

const baseItem = {
  productName: "Wallet",
  phone: "91234567",
  incidentLocation: "Main hall",
  description: "Black leather wallet",
  createdAt: "2026-01-15T10:00:00.000Z",
};

describe("ItemCard", () => {
  it("renders product details for a lost listing", () => {
    render(
      <ItemCard item={baseItem} listingType="lost" canModify={false} />
    );

    expect(screen.getByText(/Wallet/)).toBeInTheDocument();
    expect(
      screen.getByText(/Description of the lost property/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Black leather wallet/)).toBeInTheDocument();
  });

  it("shows owner actions when canModify is true", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <ItemCard
        item={baseItem}
        listingType="lost"
        canModify
        onEdit={vi.fn()}
        onDelete={onDelete}
        onMarkRecovered={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark as found/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(baseItem);
  });
});
