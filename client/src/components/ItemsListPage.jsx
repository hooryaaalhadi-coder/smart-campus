import { useCallback, useEffect, useState } from "react";
import IncidentDatePicker from "./IncidentDatePicker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import { IoArrowBack } from "react-icons/io5";
import { MdOutlinePhone, MdOutlineCalendarToday } from "react-icons/md";
import { RiMapPinLine, RiFileTextLine } from "react-icons/ri";
import { FaRegKeyboard } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import ItemCard from "./ItemCard";
import {
  fetchItems,
  removeItem,
  updateItem,
  markListingResolved,
  clearItemsError,
  resetMutation,
} from "../features/itemsSlice";
import {
  addListingUpdated,
  addListingDeleted,
} from "../features/listingNotificationsSlice";
import { AddItemValidation } from "../validations/AddItemValidation";
import ListingImageInput from "./ListingImageInput";

const ItemsListPage = ({ listingType, title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user.user);
  const { list, status, error, mutationStatus, mutationError } = useSelector(
    (s) => s.items
  );

  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [editCoords, setEditCoords] = useState({ lat: null, lng: null });
  const [editGeoLoading, setEditGeoLoading] = useState(false);
  const [editGeoHint, setEditGeoHint] = useState("");
  const [editImage, setEditImage] = useState(null);

  const load = useCallback(() => {
    dispatch(fetchItems(listingType));
  }, [dispatch, listingType]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    dispatch(clearItemsError());
  }, [dispatch, listingType]);

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
    if (!editingItem) return;
    reset({
      productName: editingItem.productName || "",
      phone: editingItem.phone || "",
      incidentDate: editingItem.incidentDate
        ? moment(editingItem.incidentDate).format("YYYY-MM-DD")
        : "",
      incidentLocation: editingItem.incidentLocation || "",
      description: editingItem.description || "",
    });
  }, [editingItem, reset]);

  const openEdit = (item) => {
    setEditingItem(item);
    setEditCoords({
      lat: item.latitude ?? null,
      lng: item.longitude ?? null,
    });
    setEditImage(item.image || null);
    setEditGeoHint("");
    setEditOpen(true);
    dispatch(resetMutation());
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingItem(null);
    setEditCoords({ lat: null, lng: null });
    setEditGeoHint("");
    setEditImage(null);
    dispatch(resetMutation());
  };

  const captureEditLocation = () => {
    if (!navigator.geolocation) {
      setEditGeoHint("Geolocation is not supported.");
      return;
    }
    setEditGeoLoading(true);
    setEditGeoHint("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setEditCoords({ lat, lng });
        setValue(
          "incidentLocation",
          `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          { shouldValidate: true }
        );
        setEditGeoLoading(false);
        setEditGeoHint("GPS coordinates updated.");
      },
      () => {
        setEditGeoLoading(false);
        setEditGeoHint("Could not read GPS. Allow permission or type manually.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const onUpdate = async (data) => {
    if (!editingItem || !user?._id) return;
    try {
      await dispatch(
        updateItem({
          id: editingItem._id,
          userId: user._id,
          productName: data.productName,
          phone: data.phone,
          incidentDate: data.incidentDate,
          incidentLocation: data.incidentLocation,
          description: data.description,
          latitude: editCoords.lat,
          longitude: editCoords.lng,
          image: editImage,
        })
      ).unwrap();
      dispatch(
        addListingUpdated({
          userId: user._id,
          productName: data.productName,
          listingType,
        })
      );
      closeEdit();
      load();
    } catch {
      /* mutationError */
    }
  };

  const onMarkRecovered = async (item) => {
    if (!user?._id || listingType !== "lost") return;
    if (
      !window.confirm(
        "You found this item? Your post will be removed from the lost list for everyone."
      )
    ) {
      return;
    }
    setResolvingId(String(item._id));
    dispatch(clearItemsError());
    try {
      await dispatch(
        markListingResolved({
          id: item._id,
          userId: user._id,
          resolved: true,
        })
      ).unwrap();
    } catch {
      /* mutationError from slice */
    } finally {
      setResolvingId(null);
    }
  };

  const onMarkReturned = async (item) => {
    if (!user?._id || listingType !== "found") return;
    if (
      !window.confirm(
        "Returned this to the owner? Your post will be removed from the found list for everyone."
      )
    ) {
      return;
    }
    setResolvingId(String(item._id));
    dispatch(clearItemsError());
    try {
      await dispatch(
        markListingResolved({
          id: item._id,
          userId: user._id,
          resolved: true,
        })
      ).unwrap();
    } catch {
      /* mutationError from slice */
    } finally {
      setResolvingId(null);
    }
  };

  const onDelete = async (item) => {
    if (!user?._id) return;
    if (!window.confirm("Delete this listing?")) return;
    setDeletingId(String(item._id));
    try {
      await dispatch(
        removeItem({ id: item._id, userId: user._id })
      ).unwrap();
      dispatch(
        addListingDeleted({
          userId: user._id,
          productName: item.productName,
          listingType,
        })
      );
      load();
    } catch {
      load();
    } finally {
      setDeletingId(null);
    }
  };

  const loading = status === "loading";
  const savingEdit = mutationStatus === "loading" && editOpen;

  return (
    <div className="lf-page">
      <Container className="lf-page-inner py-3 py-md-4">
        <div className="lf-subheader">
          <button
            type="button"
            className="lf-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <IoArrowBack size={28} />
          </button>
          <h1 className="lf-title">{title}</h1>
          <Link
            to={`/add-item?type=${listingType}`}
            className="lf-subheader-add auth-link text-decoration-none fw-semibold"
          >
            Add
          </Link>
        </div>

        {loading ? (
          <div className="lf-loading text-center py-5">
            <Spinner color="primary" className="lf-spinner" />
            <p className="text-muted small mt-2 mb-0">Loading listings…</p>
          </div>
        ) : null}

        {error && !loading ? (
          <p className="text-danger text-center small">{error}</p>
        ) : null}

        {mutationError && !editOpen ? (
          <p className="text-danger text-center small">{mutationError}</p>
        ) : null}

        {!loading && list.length === 0 ? (
          <p className="text-center text-muted py-4 lf-empty">
            No listings yet.{" "}
            <Link
              to={`/add-item?type=${listingType}`}
              className="auth-link fw-semibold"
            >
              Add one
            </Link>
          </p>
        ) : null}

        <div className="lf-list">
          {list.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              listingType={listingType}
              canModify={user && String(item.userId) === String(user._id)}
              onEdit={openEdit}
              onDelete={onDelete}
              deleting={deletingId === String(item._id)}
              onMarkRecovered={
                listingType === "lost" ? onMarkRecovered : undefined
              }
              onMarkReturned={
                listingType === "found" ? onMarkReturned : undefined
              }
              resolving={resolvingId === String(item._id)}
            />
          ))}
        </div>
      </Container>

      <Modal isOpen={editOpen} toggle={closeEdit} className="lf-edit-modal">
        <ModalHeader toggle={closeEdit}>Edit listing</ModalHeader>
        <form onSubmit={handleSubmit(onUpdate)}>
          <ModalBody>
            {mutationError ? (
              <p className="text-danger small">{mutationError}</p>
            ) : null}
            <ListingImageInput
              image={editImage}
              onImageChange={setEditImage}
              inputId="edit-listing-photo"
            />
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <FaRegKeyboard />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Item name"
                  aria-label="Item name"
                  {...register("productName")}
                />
              </div>
              <p className="text-danger small mb-0">{errors.productName?.message}</p>
            </FormGroup>
            <FormGroup>
              <div className="input-group">
                <span className="input-group-text">
                  <MdOutlinePhone />
                </span>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="8 digits, starts with 7 or 9"
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
                  placeholder="Location — place or GPS"
                  aria-label="Location of incident"
                  {...register("incidentLocation")}
                />
              </div>
              <div className="mt-2 d-flex flex-wrap align-items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="lf-geo-btn"
                  onClick={captureEditLocation}
                  disabled={editGeoLoading}
                >
                  {editGeoLoading ? (
                    <>
                      <Spinner size="sm" className="me-1" /> Locating…
                    </>
                  ) : (
                    "Use current location (GPS)"
                  )}
                </Button>
              </div>
              {editGeoHint ? (
                <p className="text-muted small mb-0 mt-1">{editGeoHint}</p>
              ) : null}
              {editCoords.lat != null && editCoords.lng != null ? (
                <p className="small mb-0 mt-1 lf-geo-saved">
                  DB: lat {editCoords.lat.toFixed(6)}, lng{" "}
                  {editCoords.lng.toFixed(6)}
                </p>
              ) : null}
              <p className="text-danger small mb-0">
                {errors.incidentLocation?.message}
              </p>
            </FormGroup>
            <FormGroup className="mb-0">
              <div className="input-group align-items-start lf-textarea-group">
                <span className="input-group-text">
                  <RiFileTextLine />
                </span>
                <textarea
                  className="form-control lf-textarea"
                  rows={4}
                  placeholder="Description"
                  aria-label="Description"
                  {...register("description")}
                />
              </div>
              <p className="text-danger small mb-0">
                {errors.description?.message}
              </p>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" outline type="button" onClick={closeEdit}>
              Cancel
            </Button>
            <Button type="submit" className="auth-btn-primary" disabled={savingEdit}>
              {savingEdit ? <Spinner size="sm" /> : "Save changes"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default ItemsListPage;
