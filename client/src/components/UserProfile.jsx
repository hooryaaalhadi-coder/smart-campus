import { Button, Col, Container, FormGroup, Row } from "reactstrap";
import { FaRegUser } from "react-icons/fa6";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateProfile, clearMessage } from "../features/UserSlice";
import { EditProfileValidation } from "../validations/EditProfileValidation";

const UserProfile = () => {
  const user = useSelector((s) => s.user.user);
  const message = useSelector((s) => s.user.message);
  const isLoading = useSelector((s) => s.user.isLoading);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    setError,
  } = useForm({
    context: { changePassword: showPassword },
    resolver: yupResolver(EditProfileValidation),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, reset]);

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  const onSubmit = (data) => {
    if (!user?._id) {
      setError("root", {
        type: "manual",
        message: "Session expired. Please login again.",
      });
      return;
    }

    dispatch(
      updateProfile({
        userId: user._id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: user.email,
        ...(showPassword && data.newPassword
          ? { oldPassword: data.oldPassword, newPassword: data.newPassword }
          : {}),
      })
    );
  };

  const handleCancel = () => {
    navigate("/home");
  };

  const togglePasswordFields = () => {
    const next = !showPassword;
    setShowPassword(next);
    dispatch(clearMessage());
    if (!next) {
      reset((vals) => ({
        ...vals,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      clearErrors(["oldPassword", "newPassword", "confirmPassword"]);
    }
  };

  const serverError =
    message && message !== "Profile updated" ? message : "";

  return (
    <Container className="auth-page">
      <Row className="justify-content-center align-items-center min-vh-100 py-4">
        <Col xs={11} sm={10} md={8} lg={5}>
          <form
            className="auth-card"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="text-center mb-3">
              <CgProfile size={60} color="#16a184" />
              <h4 className="mt-2 fw-bold">Edit Profile</h4>
              <p className="text-center text-muted mb-0 small">
                Update your account details.
              </p>
            </div>
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <FaRegUser />
                </span>
                <input
                  type="text"
                  placeholder="Enter your first name..."
                  className="form-control text-success"
                  autoComplete="given-name"
                  {...register("firstname")}
                />
              </div>
              <p className="text-danger">{errors.firstname?.message}</p>
            </FormGroup>
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <FaRegUser />
                </span>
                <input
                  type="text"
                  placeholder="Enter your last name..."
                  className="form-control text-success"
                  autoComplete="family-name"
                  {...register("lastname")}
                />
              </div>
              <p className="text-danger">{errors.lastname?.message}</p>
            </FormGroup>
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <MdOutlineMailOutline />
                </span>
                <input
                  type="email"
                  readOnly
                  aria-readonly="true"
                  title="Email cannot be changed"
                  className="form-control text-success form-control-readonly-email"
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
              <p className="text-muted small mb-0 mt-1">Email cannot be changed.</p>
              <p className="text-danger">{errors.email?.message}</p>
            </FormGroup>
            <Button
              type="button"
              className="w-100 mb-3 auth-btn-primary"
              onClick={togglePasswordFields}
            >
              {showPassword ? "Cancel Password Change" : "Change Password"}
            </Button>

            {showPassword && (
              <>
                <FormGroup>
                  <div className="input-group">
                    <span className="input-group-text">
                      <RiLockPasswordLine />
                    </span>
                    <input
                      type="password"
                      placeholder="Enter your current password..."
                      className="form-control"
                      autoComplete="current-password"
                      {...register("oldPassword")}
                    />
                  </div>
                  <p className="text-danger">{errors.oldPassword?.message}</p>
                </FormGroup>

                <FormGroup>
                  <div className="input-group">
                    <span className="input-group-text">
                      <RiLockPasswordLine />
                    </span>
                    <input
                      type="password"
                      placeholder="Enter your new password..."
                      className="form-control"
                      autoComplete="new-password"
                      {...register("newPassword")}
                    />
                  </div>
                  <p className="text-danger">{errors.newPassword?.message}</p>
                </FormGroup>

                <FormGroup>
                  <div className="input-group">
                    <span className="input-group-text">
                      <RiLockPasswordLine />
                    </span>
                    <input
                      type="password"
                      placeholder="Confirm your new password..."
                      className="form-control"
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                    />
                  </div>
                  <p className="text-danger">
                    {errors.confirmPassword?.message}
                  </p>
                </FormGroup>
              </>
            )}
            {message === "Profile updated" && (
              <p className="text-success text-center small mb-2">
                Saved successfully.
              </p>
            )}
            {errors.root?.message && (
              <p className="text-danger text-center small mb-2">
                {errors.root.message}
              </p>
            )}
            {serverError && message !== "Profile updated" && (
              <p className="text-danger text-center small mb-2">
                {serverError}
              </p>
            )}
            <div className="text-center d-flex justify-content-center gap-3 mt-1 flex-wrap">
              <Button
                type="submit"
                className="auth-btn-primary profile-btn"
                disabled={isLoading}
              >
                {isLoading ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                className="profile-btn auth-btn-secondary"
                color="danger"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
