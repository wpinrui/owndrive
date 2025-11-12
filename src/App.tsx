// import { FileDrop } from "./components/FileDrop";

import FileList from "./components/FileList";
import FileUploader from "./components/FileUploader";
import ResetCredentialButton from "./components/ResetCredentialButton";

function App() {
  return (
    <div>
      <div className="d-flex">
        <FileUploader />
        <ResetCredentialButton />
      </div>
      <FileList />
    </div>
  );
}

export default App;
