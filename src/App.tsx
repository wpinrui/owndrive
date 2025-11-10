// import { FileDrop } from "./components/FileDrop";

import { FileList } from "./components/FileList";
import { FileUploader } from "./components/FileUploader";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>OwnDrive</h1>
      <FileUploader />
      <FileList />
    </div>
  );
}

export default App;
