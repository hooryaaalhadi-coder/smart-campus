import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Col,
  Container,
  FormGroup,
  Row,
  Spinner,
} from "reactstrap";
import { IoArrowBack } from "react-icons/io5";
import { MdOutlinePhone, MdOutlineCalendarToday } from "react-icons/md";
import { RiMapPinLine, RiFileTextLine } from "react-icons/ri";
import { FaRegKeyboard } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AddItemValidation } from "../validations/AddItemValidation";
import { createItem, clearItemsError, resetMutation } from "../features/itemsSlice";
import IncidentDatePicker from "./IncidentDatePicker";
import ListingImageInput from "./ListingImageInput";

const AddItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((s) => s.user.user);
  const { mutationStatus, mutationError } = useSelector((s) => s.items);

  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoHint, setGeoHint] = useState("");
  const [itemImage, setItemImage] = useState(null);

  const listingType = useMemo(
    () => (searchParams.get("type") === "found" ? "found" : "lost"),
    [searchParams]
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AddItemValidation),
    defaultValues: {
      productName: "",
      phone: "",
      incidentDate: "",
      incidentLocation: "",
      description: "",
    },
  });

  useEffect(() => {
    dispatch(clearItemsError());
    dispatch(resetMutation());
  }, [dispatch]);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGeoHint("Geolocation is not supported in this browser.");
      return;
    }
    setGeoLoading(true);
    setGeoHint("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setValue(
          "incidentLocation",
          `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          { shouldValidate: true }
        );
        setGeoLoading(false);
        setGeoHint("Location saved (latitude & longitude).");
      },
      () => {
        setGeoLoading(false);
        setGeoHint(
          "Could not read GPS. Allow location permission or type the place manually."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const onSubmit = async (data) => {
    if (!user?._id) return;
    try {
      await dispatch(
        createItem({
          userId: user._id,
          listingType,
          productName: data.productName,
          phone: data.phone,
          incidentDate: data.incidentDate,
          incidentLocation: data.incidentLocation,
          description: data.description,
          latitude: coords.lat,
          longitude: coords.lng,
          image: itemImage,
        })
      ).unwrap();
      reset();
      setCoords({ lat: null, lng: null });
      setGeoHint("");
      setItemImage(null);
      navigate(listingType === "found" ? "/found" : "/lost", { replace: true });
    } catch (_) {
      /* mutationError */
    }
  };

  const submitting = mutationStatus === "loading";

  return (
    <div className="lf-page add-item-page">
      <Container className="lf-page-inner py-3 py-md-4">
        <div className="lf-subheader">
          <button
            type="button"
            className="lf-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <IoArrowBack size={22} />
          </button>
          <h1 className="lf-title">Add Item</h1>
          <span className="lf-subheader-spacer" aria-hidden />
        </div>

        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={7}>
            <div className="add-item-card auth-card">
              <p className="text-center text-muted small mb-3">
                New{" "}
                <strong className="lf-add-kind">
                  {listingType === "lost" ? "lost" : "found"}
                </strong>{" "}
                listing — required fields below; photo optional (images only).
              </p>

              {mutationError ? (
                <p className="text-danger text-center small">{mutationError}</p>
              ) : null}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <ListingImageInput
                  image={itemImage}
                  onImageChange={setItemImage}
                  inputId="add-listing-photo"
                />
                <FormGroup>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaRegKeyboard />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Item name (e.g. HP laptop)"
                      aria-label="Item name"
                      {...register("productName")}
                    />
                  </div>
                  <p className="text-danger small mb-0">
                    {errors.productName?.message}
                  </p>
                </FormGroup>
                <FormGroup>
                  <div className="input-group">
                    <span className="input-group-text">
                      <MdOutlinePhone />
                    </span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="8 digits, starts with 7 or 9 (e.g. 91234567)"
                      autoComplete="tel"
                      aria-label="Phone number"
                      {...register("phone")}
                    />
                  </div>
                  <p className="text-danger small mb-0">{errors.phone?.message}</p>
                </FormGroup>
                <FormGroup>
                  <div
                    className="input-group"
                    role="group"
                    aria-label="Date of incident"
                  >
                    <span className="input-group-text">
                      <MdOutlineCalendarToday />
                    </span>
                    <IncidentDatePicker control={control} />
                  </div>
                  <p className="text-danger small mb-0">
                    {errors.incidentDate?.message}
                  </p>
                </FormGroup>
                <FormGroup>
                  <div className="input-group">
                    <span className="input-group-text">
                      <RiMapPinLine />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Where it happened — place name or GPS"
                      aria-label="Location of incident"
                      {...register("incidentLocation")}
                    />
                  </div>
                  <div className="mt-2 d-flex flex-wrap align-items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="lf-geo-btn"
                      onClick={captureLocation}
                      disabled={geoLoading}
                    >
                      {geoLoading ? (
                        <>
                          <Spinner size="sm" className="me-1" /> Locating…
                        </>
                      ) : (
                        "Use current location (GPS)"
                      )}
                    </Button>
                  </div>
                  {geoHint ? (
                    <p className="text-muted small mb-0 mt-1">{geoHint}</p>
                  ) : null}
                  {coords.lat != null && coords.lng != null ? (
                    <p className="small mb-0 mt-1 lf-geo-saved">
                      Database: latitude {coords.lat.toFixed(6)}, longitude{" "}
                      {coords.lng.toFixed(6)}
                    </p>
                  ) : null}
                  <p className="text-danger small mb-0">
                    {errors.incidentLocation?.message}
                  </p>
                </FormGroup>
                <FormGroup>
                  <div className="input-group align-items-start lf-textarea-group">
                    <span className="input-group-text">
                      <RiFileTextLine />
                    </span>
                    <textarea
                      className="form-control lf-textarea"
                      rows={4}
                      placeholder="Description — details about the item…"
                      aria-label="Description"
                      {...register("description")}
                    />
                  </div>
                  <p className="text-danger small mb-0">
                    {errors.description?.message}
                  </p>
                </FormGroup>

                <div className="text-center mt-3">
                  <Button
                    type="submit"
                    className="auth-btn-primary px-5"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="me-2" /> Submitting…
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>

                <p className="text-center small-text mt-3 mb-0">
                  <Link to="/home" className="auth-link text-decoration-none">
                    Back to home
                  </Link>
                </p>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddItem;
