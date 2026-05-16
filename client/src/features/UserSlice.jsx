import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/api";
import {
  writeStoredUser,
  clearStoredUser,
} from "../authStorage";

const initialState = {
  user: null,
  message: "",
  isLoading: false,
  isSuccess: false,
  isError: false,
};

export const addUser = createAsyncThunk(
  "user/addUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.post("https://smart-campus-j4fe.onrender.com/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.post("https://smart-campus-j4fe.onrender.com/login", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await API.put("https://smart-campus-j4fe.onrender.com/profile", payload);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Update failed";
      return rejectWithValue(msg);
    }
  }
);

export const resetPasswordByEmail = createAsyncThunk(
  "user/resetPasswordByEmail",
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await API.post("/reset-password", {
        email,
        newPassword,
      });
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Could not reset password";
      return rejectWithValue(msg);
    }
  }
);

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: () => {
      clearStoredUser();
      return { ...initialState };
    },
    clearMessage: (state) => {
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addUser.pending, (state) => {
        state.isLoading = true;
        state.message = "";
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message || "";
        state.isSuccess = action.payload.message === "User Registered";
        state.isError = false;
      })
      .addCase(addUser.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.message = "Could not register";
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.message = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) {
          state.isSuccess = true;
          state.user = action.payload.user;
          writeStoredUser(action.payload.user);
          state.message = action.payload.message;
          state.isError = false;
        } else {
          state.isSuccess = false;
          state.message = action.payload.message || "Login failed";
          state.isError = true;
        }
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.message = "Network error";
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.message = "";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        writeStoredUser(action.payload.user);
        state.message = action.payload.message;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Update failed";
      })
      .addCase(resetPasswordByEmail.pending, (state) => {
        state.isLoading = true;
        state.message = "";
        state.isError = false;
      })
      .addCase(resetPasswordByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message || "Password reset successfully";
        state.isError = false;
      })
      .addCase(resetPasswordByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Reset failed";
      });
  },
});

export const { logout, clearMessage } = UserSlice.actions;
export default UserSlice.reducer;
 
