import { type FC, useState } from "react";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import "./FileUploader.scss";

const ResetCredentialButton: FC = () => {
    const { resetCredentials } = useFirebaseStorage();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleReset = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await resetCredentials();
            setMessage("Firebase credentials reset successfully.");
        } catch (err: any) {
            console.error(err);
            setMessage(err.message || "Failed to reset credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="FileUploader">
            <button
                type="button"
                className="FileUploader__button"
                onClick={handleReset}
                disabled={loading}
            >
                {loading ? (
                    <span className="FileUploader__spinner"></span>
                ) : (
                    <span className="material-icons FileUploader__icon">restart_alt</span>
                )}
                {loading ? "Resetting..." : "Reset Credentials"}
            </button>

            {message && <div className="FileUploader__toast">{message}</div>}
        </div>
    );
};

export default ResetCredentialButton;
