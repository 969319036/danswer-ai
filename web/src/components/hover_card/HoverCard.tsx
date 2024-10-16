import React, { ReactNode } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";

const CustomHoverCard = ({
	children,
	innerText
}: { 
	children: ReactNode,
	innerText: ReactNode
}) => (
	<HoverCard.Root>
		<HoverCard.Trigger asChild>
			{innerText}
		</HoverCard.Trigger>
		<HoverCard.Portal>
			<HoverCard.Content
				className="w-[300px] rounded-md bg-white p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade data-[state=open]:transition-all"
				sideOffset={5}
			>
				{children}
				<HoverCard.Arrow className="fill-white" />
			</HoverCard.Content>
		</HoverCard.Portal>
	</HoverCard.Root>
);

export default CustomHoverCard;
