import React from "react";

export const CautionTriangle = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <>
      <svg {...props}>
        <path d="M20.0051526,16.0130814 C20.0051526,16.3394431 19.9651454,16.6653049 19.8856311,16.9816708 L19.1705023,19.8389596 C19.0734848,20.2287943 18.7234217,20.5006791 18.3218494,20.5006791 L17.6877352,20.5006791 C17.2861628,20.5006791 16.9360998,20.2287943 16.8390823,19.8389596 L16.1239535,16.9816708 C16.0444392,16.6653049 16.004432,16.3394431 16.004432,16.0130814 L16.004432,12.258673 C16.004432,11.8443486 16.3404925,11.5094905 16.7545671,11.5094905 L19.2550175,11.5094905 C19.6690921,11.5094905 20.0051526,11.8443486 20.0051526,12.258673 L20.0051526,16.0130814 Z M18.0047923,25.9968492 C16.9000933,25.9968492 16.004432,25.1017286 16.004432,23.9986962 C16.004432,22.8946642 16.9000933,22.0000435 18.0047923,22.0000435 C19.1094913,22.0000435 20.0051526,22.8946642 20.0051526,23.9986962 C20.0051526,25.1017286 19.1094913,25.9968492 18.0047923,25.9968492 Z M30.6590717,24.2660829 L20.1356761,6.22722976 C19.1805041,4.59092341 16.8225793,4.59092341 15.8674073,6.22722976 L5.34401171,24.2660829 C4.37883786,25.919382 5.56755198,28 7.47789609,28 L28.5246872,28 C30.4350313,28 31.6237455,25.919382 30.6590717,24.2660829 Z"></path>
      </svg>
    </>
  );
};