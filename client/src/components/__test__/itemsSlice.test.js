import reducer, {
  clearItemsError,
  resetMutation,
  fetchItems,
  removeItem,
  markListingResolved,
} from "../../features/itemsSlice";

const initialState = {
  list: [],
  listType: null,
  status: "idle",
  error: null,
  mutationStatus: "idle",
  mutationError: null,
};

describe("itemsSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it("clearItemsError clears error and mutationError", () => {
    const prev = {
      ...initialState,
      error: "Load failed",
      mutationError: "Save failed",
    };
    const next = reducer(prev, clearItemsError());
    expect(next.error).toBeNull();
    expect(next.mutationError).toBeNull();
  });

  it("resetMutation resets mutation status fields", () => {
    const prev = {
      ...initialState,
      mutationStatus: "failed",
      mutationError: "Network error",
    };
    const next = reducer(prev, resetMutation());
    expect(next.mutationStatus).toBe("idle");
    expect(next.mutationError).toBeNull();
  });

  it("fetchItems.fulfilled stores items and listing type", () => {
    const items = [{ _id: "1", productName: "Wallet" }];
    const action = fetchItems.fulfilled(
      { listingType: "lost", items },
      "req-1",
      "lost"
    );
    const next = reducer(initialState, action);
    expect(next.status).toBe("succeeded");
    expect(next.list).toEqual(items);
    expect(next.listType).toBe("lost");
  });

  it("fetchItems.rejected sets failed status and error message", () => {
    const action = fetchItems.rejected(
      new Error("fail"),
      "req-2",
      "lost",
      "Failed to load items"
    );
    const next = reducer(
      { ...initialState, status: "loading" },
      action
    );
    expect(next.status).toBe("failed");
    expect(next.error).toBe("Failed to load items");
  });

  it("removeItem.fulfilled removes the item from the list", () => {
    const prev = {
      ...initialState,
      list: [{ _id: "1" }, { _id: "2" }],
    };
    const action = removeItem.fulfilled("1", "req-3", { id: "1", userId: "u1" });
    const next = reducer(prev, action);
    expect(next.mutationStatus).toBe("succeeded");
    expect(next.list).toHaveLength(1);
    expect(next.list[0]._id).toBe("2");
  });

  it("markListingResolved.fulfilled removes resolved listing from public list", () => {
    const prev = {
      ...initialState,
      list: [{ _id: "9", productName: "Keys" }],
    };
    const action = markListingResolved.fulfilled(
      { id: "9", resolved: true, item: { _id: "9", resolved: true } },
      "req-4",
      { id: "9", userId: "u1", resolved: true }
    );
    const next = reducer(prev, action);
    expect(next.list).toHaveLength(0);
  });
});
