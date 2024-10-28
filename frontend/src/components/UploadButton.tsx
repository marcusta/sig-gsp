import React, { useState } from "react";

import { uploadJsonContent } from "@/api/useApi";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";

const UploadButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState("");

  const handleSubmit = async () => {
    try {
      await uploadJsonContent(jsonContent);
      setOpen(false);
      setJsonContent("");
    } catch (error) {
      console.error("Error uploading JSON content:", error);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        onClick={() => setOpen(true)}
        variant={"outline"}
        className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
      >
        Upload JSON
      </Button>

      {/* Dialog */}
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          <DialogContent
            className="bg-white p-6 rounded-md shadow-lg z-50 w-[80vw] h-[80vh] max-w-none max-h-none"
            style={{ zIndex: 50 }}
          >
            <DialogTitle className="text-lg font-bold mb-4">
              Upload JSON
            </DialogTitle>
            <Textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              placeholder="Paste your JSON content here"
              className="w-full p-2 border rounded h-[60vh]" // Adjusting height of textarea
            />
            <div className="flex justify-end mt-4 space-x-2">
              <Button onClick={() => setOpen(false)} className="bg-gray-300">
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default UploadButton;
