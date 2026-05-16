import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/api";

export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async (listingType, { rejectWithValue }) => {
    try {
      const res = await API.get("/items", {
        params: { type: listingType },
      });
      return { listingType, items: res.data };
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to load items"
      );
    }
  }
);

export const createItem = createAsyncThunk(
  "items/createItem",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.post("/items", payload);
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to create listing"
      );
    }
  }
);

export const updateItem = createAsyncThunk(
  "items/updateItem",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/items/${id}`, payload);
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to update listing"
      );
    }
  }
);

export const removeItem = createAsyncThunk(
  "items/removeItem",
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      await API.delete(`/items/${id}`, { data: { userId } });
      return id;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to delete listing"
      );
    }
  }
);

/** Owner marks listing resolution (lost: found / found: returned) — removed from public feed when resolved. */
export const markListingResolved = createAsyncThunk(
  "items/markListingResolved",
  async ({ id, userId, resolved }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`/items/${id}/resolution`, {
        userId,
        resolved,
      });
      return { id, resolved, item: res.data };
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Could not update status"
      );
    }
  }
);

const initialState = {
  list: [],
  listType: null,
  status: "idle",
  error: null,
  mutationStatus: "idle",
  mutationError: null,
};

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    clearItemsError: (state) => {
      state.error = null;
      state.mutationError = null;
    },
    resetMutation: (state) => {
      state.mutationStatus = "idle";
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.items;
        state.listType = action.payload.listingType;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error";
      })
      .addCase(createItem.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(createItem.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(createItem.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError = action.payload;
      })
      .addCase(updateItem.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(updateItem.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError = action.payload;
      })
      .addCase(removeItem.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const id = String(action.payload);
        state.list = state.list.filter((i) => String(i._id) !== id);
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError = action.payload;
      })
      .addCase(markListingResolved.fulfilled, (state, action) => {
        const id = String(action.payload.id);
        if (action.payload.resolved) {
          state.list = state.list.filter((i) => String(i._id) !== id);
        } else {
          state.list = state.list.map((i) =>
            String(i._id) === id ? { ...i, ...action.payload.item } : i
          );
        }
      })
      .addCase(markListingResolved.rejected, (state, action) => {
        state.mutationError = action.payload;
      });
  },
});

export const { clearItemsError, resetMutation } = itemsSlice.actions;
export default itemsSlice.reducer;
