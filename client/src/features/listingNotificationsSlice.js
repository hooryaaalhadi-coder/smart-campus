import { createSlice, nanoid } from "@reduxjs/toolkit";

const STORAGE_KEY = "smart-campus-listing-notifications";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

const listingNotificationsSlice = createSlice({
  name: "listingNotifications",
  initialState: {
    items: loadFromStorage(),
  },
  reducers: {
    addListingPosted: (state, action) => {
      const { userId, productName, listingType } = action.payload;
      if (!userId) return;
      const kind = listingType === "found" ? "found" : "lost";
      const id = `local:${nanoid()}`;
      const name = String(productName || "Item").trim().slice(0, 80);
      state.items.unshift({
        id,
        userId: String(userId),
        title: "Listing published",
        body: `Your “${name}” ${kind} post is now live on the board.`,
        to: kind === "found" ? "/found" : "/lost",
        createdAt: Date.now(),
      });
      state.items = state.items.slice(0, 80);
      saveToStorage(state.items);
    },
    addListingUpdated: (state, action) => {
      const { userId, productName, listingType } = action.payload;
      if (!userId) return;
      const kind = listingType === "found" ? "found" : "lost";
      const id = `local:${nanoid()}`;
      const name = String(productName || "Item").trim().slice(0, 80);
      state.items.unshift({
        id,
        userId: String(userId),
        title: "Listing updated",
        body: `Your “${name}” ${kind} listing was saved successfully.`,
        to: kind === "found" ? "/found" : "/lost",
        createdAt: Date.now(),
      });
      state.items = state.items.slice(0, 80);
      saveToStorage(state.items);
    },
    addListingDeleted: (state, action) => {
      const { userId, productName, listingType } = action.payload;
      if (!userId) return;
      const kind = listingType === "found" ? "found" : "lost";
      const id = `local:${nanoid()}`;
      const name = String(productName || "Item").trim().slice(0, 80);
      state.items.unshift({
        id,
        userId: String(userId),
        title: "Listing deleted",
        body: `“${name}” was removed from ${kind} listings.`,
        to: kind === "found" ? "/found" : "/lost",
        createdAt: Date.now(),
      });
      state.items = state.items.slice(0, 80);
      saveToStorage(state.items);
    },
    clearListingNotificationsForUser: (state, action) => {
      const uid = String(action.payload || "");
      if (!uid) return;
      state.items = state.items.filter((i) => String(i.userId) !== uid);
      saveToStorage(state.items);
    },
  },
});

export const {
  addListingPosted,
  addListingUpdated,
  addListingDeleted,
  clearListingNotificationsForUser,
} = listingNotificationsSlice.actions;
export default listingNotificationsSlice.reducer;
