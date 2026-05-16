import { Button, Col, Container, FormGroup, Row } from "reactstrap";
import logo from "../assets/smart-campus-logo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa6";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { RegisterValidation } from "../validations/RegisterValidation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addUser, clearMessage } from "../features/UserSlice";
import { useEffect } from "react";

const Registration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const message = useSelector((state) => state.user.message);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(RegisterValidation) });

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  useEffect(() => {
    if (message === "User Registered") {
      navigate("/", { replace: true });
      dispatch(clearMessage());
    }
  }, [message, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(
      addUser({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
      })
    );
  };

  return (
    <Container className="auth-page">
      <Row className="justify-content-center align-items-center min-vh-100 py-4">
        <Col xs={11} sm={10} md={8} lg={5}>
          <form onSubmit={handleSubmit(onSubmit)} className="auth-card">
            <div>
              <img
                src={logo}
                alt="logo"
                width="180"
                className="img-fluid d-block mx-auto mb-3"
              />
            </div>
            <h3 className="text-center fw-bold mb-1">Create Account</h3>
            <p className="text-center text-muted mb-4">
              Join Smart Campus and get started in minutes.
            </p>
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <FaRegUser />
                </span>
                <input
                  type="text"
                  placeholder="Enter your first name..."
                  className="form-control text-success"
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
                  placeholder="Enter your email..."
                  className="form-control text-success"
                  {...register("email")}
                />
              </div>
              <p className="text-danger">{errors.email?.message}</p>
            </FormGroup>
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <RiLockPasswordLine />
                </span>
                <input
                  type="password"
                  placeholder="Enter your password..."
                  className="form-control"
                  {...register("password")}
                />
              </div>
              <p className="text-danger">{errors.password?.message}</p>
            </FormGroup>
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <RiLockPasswordLine />
                </span>
                <input
                  type="password"
                  placeholder="Enter your confirm password..."
                  className="form-control"
                  {...register("confirmPassword")}
                />
              </div>
              <p className="text-danger">{errors.confirmPassword?.message}</p>
            </FormGroup>
            {message && message !== "User Registered" && (
              <p className="text-danger text-center small">{message}</p>
            )}
            <div className="text-center">
              <p className="small-text">
                You already have an account?{" "}
                <Link to="/" className="text-decoration-none fw-bold auth-link">
                  Login
                </Link>
              </p>
              <Button type="submit" className="w-100 auth-btn-primary">
                Register
              </Button>
            </div>
          </form>
        </Col>
      </Row>
    </Container>
  );
};

export default Registration;
