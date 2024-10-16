import { DanswerDocument } from "@/lib/search/interfaces";
import { Divider, Text } from "@tremor/react";
import { ChatDocumentDisplay } from "./ChatDocumentDisplay";
import { usePopup } from "@/components/admin/connectors/Popup";
import { removeDuplicateDocs } from "@/lib/documentUtils";
import { Message } from "../interfaces";
import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";

interface DocumentSidebarProps {
  closeSidebar: () => void;
  selectedMessage: Message | null;
  selectedDocuments: DanswerDocument[] | null;
  toggleDocumentSelection: (document: DanswerDocument) => void;
  clearSelectedDocuments: () => void;
  selectedDocumentTokens: number;
  maxTokens: number;
  isLoading: boolean;
  initialWidth: number;
  isOpen: boolean;
  currentDocLink: string | null;
}

export const DocumentSidebar = forwardRef<HTMLDivElement, DocumentSidebarProps>(
  (
    {
      closeSidebar,
      selectedMessage,
      selectedDocuments,
      toggleDocumentSelection,
      clearSelectedDocuments,
      selectedDocumentTokens,
      maxTokens,
      isLoading,
      initialWidth,
      isOpen,
      currentDocLink
    },
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const { popup, setPopup } = usePopup();

    const selectedDocumentIds =
      selectedDocuments?.map((document) => document.document_id) || [];

    const currentDocuments = selectedMessage?.documents || null;
    const dedupedDocuments = currentDocLink 
    ? removeDuplicateDocs(currentDocuments || []).filter((doc) => doc.link === currentDocLink) 
    : removeDuplicateDocs(currentDocuments || []);

    const [width, setWidth] = useState<number>(0); 
    const requestRef = useRef<number | null>(null); 

    const animationLoop = () => {
      setWidth((prevWidth) => {
        if (isOpen) {
          if (prevWidth < initialWidth) {
            return prevWidth + 18;
          }
          return initialWidth;
        } else {
          if (prevWidth > 0) {
            return prevWidth - 18;
          }
          return 0;
        }
      });
  
      if (isOpen && width < initialWidth) {
        requestRef.current = requestAnimationFrame(animationLoop);
      } else if (!isOpen && width > 0) {
        requestRef.current = requestAnimationFrame(animationLoop);
      }
    };

    useEffect(() => {
      if (isOpen || width > 0) {
        requestRef.current = requestAnimationFrame(animationLoop);
      }
  
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }, [isOpen, width]);

    
    // NOTE: do not allow selection if less than 75 tokens are left
    // this is to prevent the case where they are able to select the doc
    // but it basically is unused since it's truncated right at the very
    // start of the document (since title + metadata + misc overhead) takes up
    // space
    const tokenLimitReached = selectedDocumentTokens > maxTokens - 75;
    const finalWidth = width <= 0 ? "0px" : `${width}px`;
    const isMdScreen = window.matchMedia("(min-width: 768px)").matches;

    return (
      <div
        id="danswer-chat-sidebar"
        className={`inset-0 fixed w-full md:static overflow-hidden ease-linear transition-[width] z-50 ${!isOpen && "pointer-events-none"}`}
        style={{
          width: isMdScreen ? finalWidth : '100%'
        }}
      >
        <div
         className={`ml-auto relative border-l bg-text-100 sidebar z-50  right-0 h-screen transition-all duration-300 ${
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[10%]"
        }`}
          ref={ref}
        >
         <button 
          onClick={() => {
            closeSidebar();
          }}
          className="transition-all absolute cursor-pointer flex items-center space-x-2 hover:bg-hover hover:text-emphasis p-1.5 right-3 top-3 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
          </button>
          <div className="pb-6 flex-initial overflow-y-hidden flex flex-col h-screen">
            {popup}
            <div className="pl-3 mx-2 pr-6 mt-3 flex text-text-800 flex-col text-2xl text-emphasis flex font-semibold">
              {dedupedDocuments.length} Documents
              <p className="text-sm font-semibold flex flex-wrap gap-x-2 text-text-600 mt-1">
                Select to add to continuous context
                <a
                  href="https://docs.danswer.dev/introduction"
                  className="underline cursor-pointer hover:text-strong"
                >
                  Learn more
                </a>
              </p>
            </div>

            <Divider className="mb-0 mt-4 pb-2" />

            {currentDocuments ? (
              <div className="overflow-y-auto flex-grow dark-scrollbar flex relative flex-col">
                {dedupedDocuments.length > 0 ? (
                  <div>
                   {dedupedDocuments.map((document, ind) => (
                      <div
                        key={document.document_id}
                        className={`${
                          ind === dedupedDocuments.length - 1
                            ? "mb-5"
                            : "border-b border-border-light mb-3"
                        }`}
                      >
                        <ChatDocumentDisplay
                          document={document}
                          setPopup={setPopup}
                          queryEventId={null}
                          isAIPick={false}
                          isSelected={selectedDocumentIds.includes(
                            document.document_id
                          )}
                          handleSelect={(documentId) => {
                            toggleDocumentSelection(
                              dedupedDocuments.find(
                                (document) => document.document_id === documentId
                              )!
                            );
                          }}
                          tokenLimitReached={tokenLimitReached}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mx-3">
                    <Text>No documents found for the query.</Text>
                  </div>
                )}
              </div>
            ) : (
              !isLoading && (
                <div className="ml-4 mr-3">
                  <Text>
                    When you run ask a question, the retrieved documents will
                    show up here!
                  </Text>
                </div>
              )
            )}
          </div>

          <div className="absolute left-0 bottom-0 w-full bg-gradient-to-b from-neutral-100/0 via-neutral-100/40 backdrop-blur-xs to-neutral-100 h-[100px]" />
          <div className="sticky bottom-4 w-full left-0 justify-center flex gap-x-4">
            <button
              className="bg-[#84e49e] text-xs p-2 rounded text-text-800"
              onClick={() => closeSidebar()}
            >
              Save Changes
            </button>

            <button
              className="bg-error text-xs p-2 rounded text-text-200 flex"
              onClick={() => {
                clearSelectedDocuments();

                closeSidebar();
              }}
            >
              Delete Context
            </button>
          </div>
        </div>
      </div>
    );
  }
);

DocumentSidebar.displayName = "DocumentSidebar";
