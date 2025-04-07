import { useEffect, useRef, useState } from "react";
import "./App.css";
import React, { Component } from "react";
import "pdfjs-dist/legacy/web/pdf_viewer.css";
// import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.min.js';
// import * as pdfjsLib from 'https://esm.run/pdfjs-dist';
// import workerSrc from 'pdfjs-dist/build/pdf.worker.js';

// GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.js';
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
// import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.worker.mjs';

// Set the worker source (adjust the path based on your setup)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "node_modules/pdfjs-dist/build/pdf.worker.mjs";

function App({ documents }) {
  
  const [isSlider, setIsSlider] = useState(
    documents?.length > 1 ? true : false
  );
  const [currentDocument, setCurrentDocument] = useState(documents[0]);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [images, setImages] = useState([]);
  const imageRefs = useRef([]);
  const inp = useRef(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);

  async function convertPdfToPng(file) {
    const loadingTask = pdfjsLib.getDocument(file);
    const pdf = await loadingTask.promise;

    const images = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      images.push(canvas.toDataURL("image/png"));
    }
    setImages(images);
    return images;
  }
  async function convertFirstPageOfPdfToPng(file) {
    const loadingTask = pdfjsLib.getDocument(file);
    const pdf = await loadingTask.promise;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    return canvas.toDataURL("image/png");
  }

  useEffect(() => {
    if (documents?.length == 0) return;
    const generateThumbnails = async () => {
      const results = await Promise.all(
        documents.map(async (doc) => {
          let source;
          if (doc.type == "pdf") {
            source = await convertFirstPageOfPdfToPng(doc?.src);
          } else {
            source = doc?.src;
          }
          return source;
        })
      );
      setThumbnails(results); // preserve order
    };
    generateThumbnails();
  }, [documents]);

  useEffect(() => {
    if (currentDocument.type != "pdf") return;

    const loadData = async () => {
      setIsLoading(true);
      let path = await convertPdfToPng(currentDocument?.src);
      setIsLoading(false);
    };
    loadData();
  }, [currentDocument]);

  useEffect(() => {
    if (imageRefs.current.length === 0) return;
    imageRefs.current[pageNumber - 1].focus();
    imageRefs.current[pageNumber - 1].scrollIntoView({ behavior: "smooth" });
  }, [imageRefs]);

  const handleClick = (e, operator) => {
    e.preventDefault();
    let newPageNumber = pageNumber;
    if (operator === "+" && pageNumber < images.length) {
      newPageNumber = Math.min(pageNumber + 1, images.length);
    } else if (operator === "-" && pageNumber > 1) {
      newPageNumber = Math.max(pageNumber - 1, 1);
    }
    setPageNumber(newPageNumber);
    imageRefs.current[newPageNumber - 1].focus();
    imageRefs.current[newPageNumber - 1].scrollIntoView({
      behavior: "smooth",
      block: "center", // Ensures the image is in the center of the viewport
      inline: "nearest",
    });
  };
  const [isInput, setIsInput] = useState(false);
  const handleNumberClick = () => {
    setIsInput(true);
  };
  const handleChange = (e) => {
    let value = e.target.value;
    if (value === "") {
      setPageNumber(pageNumber);
      return;
    } else {
      value = parseInt(value);
    }

    if (value > images.length) {
      setPageNumber(images.length);
    } else if (value < 1) {
      setPageNumber(1);
    } else {
      setPageNumber(value);
    }
    imageRefs.current[value - 1].focus();
    imageRefs.current[value - 1].scrollIntoView({
      behavior: "smooth",
      block: "center", // Ensures the image is in the center of the viewport
      inline: "nearest",
    });
    setIsInput(false);
  };
  const handlePreviewClick = (index) => {
    setPageNumber(index + 1);
    imageRefs.current[index].focus();
    imageRefs.current[index].scrollIntoView({
      behavior: "smooth",
      block: "center", // Ensures the image is in the center of the viewport
      inline: "nearest",
    });
  };

  useEffect(() => {
    if (pageNumber !== null && imageRefs.current[pageNumber - 1]) {
      imageRefs.current[pageNumber - 1].focus();
      imageRefs.current[pageNumber - 1].scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [pageNumber]);

  const handleChangeDocument = (operator) => {
    setIsLoading(true);
    if (operator === "+") {
      let index = (currentDocumentIndex + 1) % documents.length;
      setCurrentDocument(documents[index]);
      setCurrentDocumentIndex(index);
    } else if (operator === "-") {
      if (currentDocumentIndex > 0) {
        setCurrentDocument(documents[currentDocumentIndex - 1]);
        setCurrentDocumentIndex(currentDocumentIndex - 1);
      }
    }
    setImages([]);
    imageRefs.current = [];
    setIsLoading(false);
  };

  const handleThumbnailClick = (index) => {
    setCurrentDocumentIndex(index);
    setCurrentDocument(documents[index])
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        backgroundColor: "#f0f0f0",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          position: "fixed",
          top: "0",
          width: "100%",
          height: "100px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(1px)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              padding: "15px 0 0 15px",
            }}
          >
            {images?.length > 0 && (
              <svg
                style={{ cursor: "pointer" }}
                onClick={() => setIsPreview(true)}
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M4 18L20 18"
                    stroke="#000000"
                    stroke-width="2"
                    stroke-linecap="round"
                  ></path>{" "}
                  <path
                    d="M4 12L20 12"
                    stroke="#000000"
                    stroke-width="2"
                    stroke-linecap="round"
                  ></path>{" "}
                  <path
                    d="M4 6L20 6"
                    stroke="#000000"
                    stroke-width="2"
                    stroke-linecap="round"
                  ></path>{" "}
                </g>
              </svg>
            )}
          </div>
          <p
            style={{
              textAlign: "center",
              wordBreak: "break-all",
              padding: "15px 15px 0 0",
            }}
          >
            {currentDocumentIndex + 1} / {documents?.length}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            padding: "15px",
            wordBreak: "break-all",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "white",
            }}
          >
            {currentDocument?.src}
          </p>
        </div>
      </div>

      {/* Slider Next Prev Button */}
      {!isLoading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            width: "100%",
            height: "85px",
            transform: "translateY(-50%)",
            zIndex: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 15px",
          }}
        >
          <div
            style={{
              color: "white",
              padding: "7px 10px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(1px)",
              borderRadius: "10px",
            }}
            onClick={() => handleChangeDocument("-")}
          >
            <svg
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              fill="#000000"
              height="20px"
              width="20px"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 55.753 55.753"
              xml:space="preserve"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <g>
                  {" "}
                  <path d="M12.745,23.915c0.283-0.282,0.59-0.52,0.913-0.727L35.266,1.581c2.108-2.107,5.528-2.108,7.637,0.001 c2.109,2.108,2.109,5.527,0,7.637L24.294,27.828l18.705,18.706c2.109,2.108,2.109,5.526,0,7.637 c-1.055,1.056-2.438,1.582-3.818,1.582s-2.764-0.526-3.818-1.582L13.658,32.464c-0.323-0.207-0.632-0.445-0.913-0.727 c-1.078-1.078-1.598-2.498-1.572-3.911C11.147,26.413,11.667,24.994,12.745,23.915z"></path>{" "}
                </g>{" "}
              </g>
            </svg>
          </div>
          <div
            style={{
              color: "white",
              padding: "7px 10px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(1px)",
              borderRadius: "10px",
            }}
            onClick={() => handleChangeDocument("+")}
          >
            <svg
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
              fill="#000000"
              height="20px"
              width="20px"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 55.752 55.752"
              xml:space="preserve"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <g>
                  {" "}
                  <path d="M43.006,23.916c-0.28-0.282-0.59-0.52-0.912-0.727L20.485,1.581c-2.109-2.107-5.527-2.108-7.637,0.001 c-2.109,2.108-2.109,5.527,0,7.637l18.611,18.609L12.754,46.535c-2.11,2.107-2.11,5.527,0,7.637c1.055,1.053,2.436,1.58,3.817,1.58 s2.765-0.527,3.817-1.582l21.706-21.703c0.322-0.207,0.631-0.444,0.912-0.727c1.08-1.08,1.598-2.498,1.574-3.912 C44.605,26.413,44.086,24.993,43.006,23.916z"></path>{" "}
                </g>{" "}
              </g>
            </svg>
          </div>
        </div>
      )}
      {currentDocument?.type === "pdf" ? (
        <>
          {/* Preview */}
          {images?.length > 0 && isPreview && (
            <div
              style={{
                background: "black",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(2px)",
                position: "fixed",
                top: "0",
                left: "0",
                height: "100vh",
                zIndex: 10,
                width: "130px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "28px 0",
                gap: "20px",
                overflow: "scroll",
              }}
            >
              <p
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "25px",
                  marginBottom: "10px",
                  padding: "10px",
                  cursor: "pointer",
                }}
                onClick={() => setIsPreview(false)}
              >
                &#10005;
              </p>
              {images.map((imgSrc, index) => (
                <div
                  id={`index-${index}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                  }}
                  key={index}
                  onClick={() => handlePreviewClick(index)}
                >
                  <img
                    src={imgSrc}
                    alt={`Page ${index + 1}`}
                    style={{
                      width: "80px",
                      height: "120 px",
                      border:
                        index == pageNumber - 1 ? "2px solid red" : "none",
                      borderRadius: "5px",
                      objectFit: "cover",
                    }}
                  />
                  <p style={{ color: "white" }}>{index + 1}</p>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          {images.length > 0 && (
            <div
              style={{
                background: "black",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(1px)",
                flexDirection: "row",
                display: "flex",
                position: "fixed",
                top: "85%",
                zIndex: 2,
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "20px",
                gap: "8px",
                borderRadius: "10px",
                border: "2px solid rgba(0, 0, 0, 0.7)",
                color: "white",
              }}
            >
              <div
                onClick={(e) => {
                  handleClick(e, "-");
                }}
                style={{
                  color: "white",
                  fontWeight: "bold",
                  padding: "2px 7px",
                  fontSize: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                -
              </div>
              <div
                style={{
                  color: "white",
                  fontWeight: "bold",
                  padding: "2px 5px",
                  fontSize: "15px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {!isInput ? (
                  <p onClick={handleNumberClick}>
                    {pageNumber < 10 ? "0" + pageNumber : pageNumber}
                  </p>
                ) : (
                  <input
                    type="number"
                    onChange={handleChange}
                    value={pageNumber}
                    style={{
                      width: "35px",
                      fontSize: "18px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />
                )}
                &nbsp;/ {images?.length <= 9 ? "0" + images?.length : images?.length}
              </div>
              <div
                onClick={(e) => {
                  handleClick(e, "+");
                }}
                style={{
                  color: "white",
                  fontWeight: "bold",
                  padding: "2px 7px",
                  fontSize: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                +
              </div>
            </div>
          )}

          {/* PDF Images */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100vh",
            }}
            onClick={() => setIsPreview(false)}
          >
            {images.length > 0 && !isLoading ? (
              [...images].map((imgSrc, index) => (
                <div
                  key={index}
                  style={{ display: "flex", height: "100vh", zIndex: 0 }}
                  ref={(element) => imageRefs.current.push(element)}
                >
                  <img
                    id={`index-${index}`}
                    src={imgSrc}
                    alt={`Page ${index + 1}`}
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "auto",
                    }}
                  />
                </div>
              ))
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span className="loader"></span>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translate(0, -50%)",
            }}
          >
            <img
              src="https://lms-mylearningalliance.s3.amazonaws.com/cms%2Fcertificate%2F673b9171f1a0a95979e3d894%2Fteam%2Fcsaenz%40steltechsolutions.com%2Fchris+saenz+digital.png"
              style={{ objectFit: "contain", height: "auto", width: "100%" }}
              alt=""
            />
          </div>
        </>
      )}

      <div
        style={{
          position: "fixed",
          bottom: "0%",
          height: "85px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(2px)",
          padding: "5px 8px",
          width: "100%",
          gap: "8px",
          display: "flex",
          overflowX: "auto",
          flexDirection: "row",
        }}
      >
        {thumbnails.length > 0 &&
          thumbnails.map((thumbnail, index) => (
            <div
              key={index}
              style={{
                flex: "0 0 auto",
                width: "70px",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "10px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: currentDocumentIndex == index ? '2px solid red': 'none'
              }}
              onClick={() => handleThumbnailClick(index)}
            >
              <img
                src={thumbnail}
                style={{
                  width: "100px",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt={`Thumbnail ${index}`}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;

{
  /* <div style={{fontSize: '50px', top:'0', left:'0', position: 'fixed', marginBottom: '10px'}}>
<input ref={inp} type="number" style={{fontSize: "50px", width: '100px'}} min="1" value={pageNumber} max={`${images?.length}`} onChange={handleChange}/>/{images.length}
</div> */
}
