// import { FileDrop } from "./components/FileDrop";

import FileList from "./components/FileList";
import FileUploader from "./components/FileUploader";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <FileUploader />
      <FileList />
    </div>
  );
}

export default App;
