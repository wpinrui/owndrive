// import { FileDrop } from "./components/FileDrop";

import FileList from "./components/FileList";
import FileUploader from "./components/FileUploader";

function App() {
  return (
    <div>
      <div className="d-flex">
        <FileUploader />
      </div>
      <FileList />
    </div>
  );
}

export default App;
