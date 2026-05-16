import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./features/UserSlice";
import ItemsReducer from "./features/itemsSlice";
import listingNotificationsReducer from "./features/listingNotificationsSlice";
import { readStoredUser } from "./authStorage";

const bootUser = readStoredUser();

export const store = configureStore({
  reducer: {
    user: UserReducer,
    items: ItemsReducer,
    listingNotifications: listingNotificationsReducer,
  },
  preloadedState: {
    user: {
      user: bootUser,
      message: "",
      isLoading: false,
      isSuccess: Boolean(bootUser),
      isError: false,
    },
  },
});
