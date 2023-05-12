import React, { useState } from "react";
import { useGetItemRelationsQuery } from "../api/codeBeamerApi";
import { RelationsQuery } from "../models/api-query-types";

export const useItemRelations = (itemId: string | number) => {
  const [relations, setRelations] = useState<RelationsQuery>();

  const { data, error, isLoading } = useGetItemRelationsQuery(itemId);

  React.useEffect(() => {
    if (data) {
      setRelations(data);
    }
  }, [data]);

  return { relations, error, isLoading };
};
