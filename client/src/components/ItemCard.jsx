import moment from "moment";
import { Button } from "reactstrap";
import { formatOmaniPhoneDisplay } from "../validations/omaniPhone";

const ItemCard = ({
  item,
  listingType,
  canModify,
  onEdit,
  onDelete,
  deleting,
  onMarkRecovered,
  onMarkReturned,
  resolving,
}) => {
  const descLabel =
    listingType === "found"
      ? "Description of the found property :"
      : "Description of the lost property :";

  const lat =
    item.latitude != null && !Number.isNaN(Number(item.latitude))
      ? Number(item.latitude)
      : null;
  const lng =
    item.longitude != null && !Number.isNaN(Number(item.longitude))
      ? Number(item.longitude)
      : null;
  const mapsUrl =
    lat != null && lng != null
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;

  const incidentFmt = item.incidentDate
    ? moment(item.incidentDate).format("dddd, MMM D, YYYY [at] h:mm A")
    : "—";

  return (
    <div className="item-card-wrap">
      <div className="item-card">
        <div className="item-card-meta">
          <span className="item-card-time">
            {item.createdAt ? moment(item.createdAt).fromNow() : "—"}
          </span>
        </div>
        <div className="item-card-row">
          <div className="item-card-body">
            <p className="item-card-line">
              <span className="item-card-label">Product Name :</span>{" "}
              {item.productName}
            </p>
            <p className="item-card-line">
              <span className="item-card-label">Phone :</span>{" "}
              {formatOmaniPhoneDisplay(item.phone)}
            </p>
            <p className="item-card-line">
              <span className="item-card-label">Date of Incident :</span>{" "}
              {incidentFmt}
            </p>
            <p className="item-card-line">
              <span className="item-card-label">Location of Incident :</span>{" "}
              {item.incidentLocation}
            </p>
            {mapsUrl ? (
              <p className="item-card-line">
                <span className="item-card-label">GPS :</span>{" "}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="item-card-map-link"
                >
                  View location
                </a>
              </p>
            ) : null}
            <p className="item-card-line item-card-desc">
              <span className="item-card-label">{descLabel}</span>{" "}
              {item.description}
            </p>
          </div>
          <div className="item-card-thumb-wrap">
            {item.image ? (
              <img src={item.image} alt="" className="item-card-thumb" />
            ) : (
              <div className="item-card-thumb item-card-thumb-placeholder">
                <span>No image</span>
              </div>
            )}
          </div>
        </div>
        {canModify ? (
          <div className="item-card-actions">
            <Button
              type="button"
              className="item-card-btn item-card-btn-edit"
              onClick={() => onEdit(item)}
              disabled={Boolean(deleting) || Boolean(resolving)}
            >
              Edit
            </Button>
            {listingType === "lost" && onMarkRecovered ? (
              <Button
                type="button"
                className="item-card-btn item-card-btn-resolved"
                title="Your post is removed from the lost list for everyone."
                onClick={() => onMarkRecovered(item)}
                disabled={Boolean(deleting) || Boolean(resolving)}
              >
                {resolving ? "…" : "Mark as found"}
              </Button>
            ) : null}
            {listingType === "found" && onMarkReturned ? (
              <Button
                type="button"
                className="item-card-btn item-card-btn-resolved"
                title="Your post is removed from the found list for everyone."
                onClick={() => onMarkReturned(item)}
                disabled={Boolean(deleting) || Boolean(resolving)}
              >
                {resolving ? "…" : "Returned to owner"}
              </Button>
            ) : null}
            <Button
              type="button"
              className="item-card-btn item-card-btn-delete"
              onClick={() => onDelete(item)}
              disabled={deleting || resolving}
            >
              {deleting ? "…" : "Delete"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ItemCard;
