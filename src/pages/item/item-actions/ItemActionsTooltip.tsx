import * as React from "react";
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";

const ItemActionsTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#4262FF",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#4262FF",
  },
}));

export default ItemActionsTooltip;
