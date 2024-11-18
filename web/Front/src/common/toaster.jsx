import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/toast.css"; 

function Toaster({ showSuccessToast }) {
  useEffect(() => {
    if (showSuccessToast) {
      toast.success("Components generated successfully!", {
        position: "bottom-right",
      //  className: "custom-toast", 
      //  bodyClassName: "custom-toast-body", 
        style: { backgroundColor: "white" },
        progressClassName: "custom-toast-progress",
        icon: "✔️",
      });
    }
  }, [showSuccessToast]);

  return <ToastContainer />;
}

export default Toaster;
