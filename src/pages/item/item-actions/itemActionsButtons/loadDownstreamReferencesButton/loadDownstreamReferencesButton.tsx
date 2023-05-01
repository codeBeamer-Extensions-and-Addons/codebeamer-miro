import React, { useRef, useState } from "react";
import Importer from "../../../../import/components/importer/Importer";
import { useItemRelations } from "../../../../../hooks/useItemRelations";
import { Tooltip, Overlay } from "react-bootstrap";

export default function LoadDownstreamReferencesButton(props: {
  itemId: string | number;
}) {
  const [
    loadDownstreamReferencesDisabled,
    setloadDownstreamReferencesDisabled,
  ] = useState<boolean>(true);
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [queryString, setQueryString] = useState<string>("");
  const [showTooltip, setShowTooltip] = useState(false);

  const { relations: data, error, isLoading } = useItemRelations(props.itemId);
  const targetTooltip = useRef(null);

  const loadDownstreamReferencesHandler = () => {
    if (data && !loadDownstreamReferencesDisabled) {
      const ids = data.downstreamReferences.map((d) =>
        d.itemRevision.id.toString()
      );
      setItemIds(ids);
      setQueryString(`item.id IN (${ids.join(",")})`);
    } else {
      console.warn(
        "Can't load Downstream References - data still loading or failed to do so."
      );
    }
  };

  React.useEffect(() => {
    if (error) {
      setloadDownstreamReferencesDisabled(true);
    } else if (data) {
      if (!data.downstreamReferences.length) {
        setloadDownstreamReferencesDisabled(true);
      } else {
        setloadDownstreamReferencesDisabled(false);
      }
    }
  }, [data, error]);

  return (
    <>
      <button
        ref={targetTooltip}
        className={`button button-tertiary ${
          isLoading ? "button-loading button-loading-primary" : ""
        }`}
        onClick={loadDownstreamReferencesHandler}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={loadDownstreamReferencesDisabled}
        data-test="load-downstream-references"
      >
        {!isLoading && (
          <>
            <span className="icon-add-row-bottom"></span>
          </>
        )}
      </button>
      <Overlay
        target={targetTooltip.current}
        show={showTooltip}
        placement="bottom"
      >
        {(props) => (
          <Tooltip {...props}>
            {data
              ? `Load Downstream References (${data.downstreamReferences.length})`
              : "Load the Item's Downstream References onto the board, if they're not yet there"}
          </Tooltip>
        )}
      </Overlay>
      {queryString && <Importer items={itemIds} queryString={queryString} />}
    </>
  );
}
