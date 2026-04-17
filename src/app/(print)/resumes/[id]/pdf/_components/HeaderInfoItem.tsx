import React, { FC, ReactNode } from "react";

import "../styles.css";

export const HeaderInfoItem: FC<{ label: string; value: ReactNode | null }> = ({
  label,
  value,
}) => {
  if (!value) return null;
  return (
    <p className="header-info-line">
      <span className="label-strong">{label}:</span> {value}
    </p>
  );
};
