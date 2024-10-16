import CustomHoverCard from "@/components/hover_card/HoverCard";
import { CustomTooltip } from "@/components/tooltip/CustomTooltip";
import { DanswerDocument } from "@/lib/search/interfaces";
import { HoverCard } from "@radix-ui/react-hover-card";
import { ReactNode, useEffect, useRef, useState } from "react";

// NOTE: This is the preivous version of the citations which works just fine
export function Citation({
  children,
  link,
  index,
  doc,
  onClickDocTitle
}: {
  doc:DanswerDocument
  link?: string;
  children?: JSX.Element | string | null | ReactNode;
  index?: number;
  onClickDocTitle?: (link: string | null) => void
}) {
  const innerText = children
    ? children?.toString().split("[")[1].split("]")[0]
    : index;
    
  const [metaData, setMetaData] = useState<{logo: {url: string | null}, publisher: string}>({
    logo: {
      url: null
    },
    publisher: ''
  })


  console.log(doc, metaData, 'docdoc')

  const fetchMetaInfo = async (url: string) => {    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const siteData = localStorage.getItem(domain);
    
      if (siteData) {
        return JSON.parse(siteData)
      }
  
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.status === 'success') {
        localStorage.setItem(domain, JSON.stringify(data.data));
        return data.data;
      }
    } catch (error) {
      console.error(`Error fetching meta info for ${url}:`, error);
    }
  };

  useEffect(() => {
    if (link) {
      fetchMetaInfo(link)
      .then(data => {
        setMetaData(data)
      })
      .catch(error => console.error(error));
    }
  }, [link])

  if (doc) {
    return (
      <CustomHoverCard 
        innerText={
          <a
            className="cursor-pointer inline ml-1 align-middle"
          >
            <span className="group relative -top-1 text-sm text-gray-500 dark:text-gray-400 selection:bg-indigo-300 selection:text-black dark:selection:bg-indigo-900 dark:selection:text-white">
              <span
                className="inline-flex bg-background-200 group-hover:bg-background-300 items-center justify-center h-3.5 min-w-3.5 px-1 text-center text-xs rounded-full border-1 border-gray-400 ring-1 ring-gray-400 divide-gray-300 dark:divide-gray-700 dark:ring-gray-700 dark:border-gray-700 transition duration-150"
                data-number="3"
              >
                {innerText}
              </span>
            </span>
          </a>
        }>
        <div className="flex flex-col gap-[7px]">
            <div 
            className="flex items-center gap-[7px]">
              {
                metaData.logo?.url && (
                  <img
                    className="block size-[25px] rounded-full"
                    src={metaData.logo.url}
                    alt={metaData.publisher}
                  />
                )
              }
              <div title={doc.semantic_identifier || link} className="m-0 line-clamp-1 text-[15px] break-words ml-1 text-default">
                {metaData.publisher || 'website'}
              </div>
            </div>
            
            <div 
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (onClickDocTitle) {
                onClickDocTitle(doc.link)
              }
            }}
            className="m-0 line-clamp-1 text-[15px] cursor-pointer break-words text-black hover:text-opacity-50 transition-opacity duration-200">
              {doc.semantic_identifier || link}
            </div>
            <div className="flex flex-col gap-[15px]">
              <div className="m-0 line-clamp-4 text-[13px] break-words pt-1 text-default">
               {doc?.blurb}
              </div>
            </div>
        </div>
      </CustomHoverCard>
    );
  } else {
    return (
      <CustomTooltip content={<div>This doc doesn&apos;t have a link!</div>}>
        <div className="inline-block cursor-help leading-none inline ml-1 align-middle">
          <span className="group relative -top-1 text-gray-500 dark:text-gray-400 selection:bg-indigo-300 selection:text-black dark:selection:bg-indigo-900 dark:selection:text-white">
            <span
              className="inline-flex bg-background-200 group-hover:bg-background-300 items-center justify-center h-3.5 min-w-3.5 flex-none px-1 text-center text-xs rounded-full border-1 border-gray-400 ring-1 ring-gray-400 divide-gray-300 dark:divide-gray-700 dark:ring-gray-700 dark:border-gray-700 transition duration-150"
              data-number="3"
            >
              {innerText}
            </span>
          </span>
        </div>
      </CustomTooltip>
    );
  }
}
