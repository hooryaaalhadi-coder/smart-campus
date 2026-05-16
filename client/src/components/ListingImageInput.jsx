import { FormGroup } from "reactstrap";

const MAX_BYTES = 2.5 * 1024 * 1024;

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export default function ListingImageInput({
  image,
  onImageChange,
  inputId = "listing-photo",
}) {
  const onFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!ALLOWED.has(f.type.toLowerCase())) {
      window.alert("Only image files are allowed (JPEG, PNG, GIF, WebP).");
      return;
    }
    if (f.size > MAX_BYTES) {
      window.alert("Image must be under 2.5 MB.");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      onImageChange(typeof r.result === "string" ? r.result : null);
    };
    r.readAsDataURL(f);
  };

  return (
    <FormGroup>
      <div className="lf-image-upload-row">
        <div className="lf-image-preview" aria-hidden={!image}>
          {image ? (
            <img src={image} alt="" className="lf-image-preview-img" />
          ) : (
            <span className="lf-image-ph">No photo</span>
          )}
        </div>
        <div className="lf-image-upload-actions">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
            id={inputId}
            className="d-none"
            onChange={onFile}
          />
          <label htmlFor={inputId} className="btn btn-sm lf-image-pick-btn mb-0">
            Upload image
          </label>
          {image ? (
            <button
              type="button"
              className="btn btn-sm lf-image-remove-btn"
              onClick={() => onImageChange(null)}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </FormGroup>
  );
}
