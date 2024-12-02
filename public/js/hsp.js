import React, { useState, createRef, useEffect } from "react";
import useDetectPrint from "react-detect-print";
import _ from "underscore";

import Utils from "./utils";
import * as Helpers from "./visualisation_helpers";

/**
 * Alignment viewer.
 */
// export default class HSP extends React.Component {
export default function HSP(props) {
  const hsp = props.hsp;
  const hspRef = createRef();
  const printing = useDetectPrint();
  const [chars, setChars] = useState(0)
  const [width, setWidth] = useState(window.innerWidth);

  const domID = () => {
    const { query, hit, hsp } = props;
    return `Query_${query.number}_hit_${hit.number}_${hsp.number}`;
  }

  const hitDOM_ID = () => {
    return "Query_" + props.query.number + "_hit_" + props.hit.number;
  }

  useEffect(() => {
    // Attach a debounced listener to handle window resize events 
    // Updates the width state with the current window width, throttled to run at most once every 125ms
    const handleResize = _.debounce(() => setWidth(window.innerWidth), 125);
    window.addEventListener("resize", handleResize);

    // TODO: print handler
    draw();
  }, [])

  useEffect(() => {
    draw(printing);
  }, [printing, width])
  
  const draw = (printing = false) => {
    const charWidth = props.getCharacterWidth();
    const containerWidth = printing ? 900 : $(hspRef.current).width();
    setChars(Math.floor((containerWidth - 4) / charWidth))
  }

  /**
   * Returns an array of span elements or plain strings (React automatically
   * adds span tag around strings). This array is passed as it is to JSX to be
   * rendered just above the pairwise alignment (see render method).
   *
   * We cannot return a string from this method otherwise we wouldn't be able
   * to use JSX elements to format text (like, superscript).
   */
  const hspStats = () => {
    // An array to hold text or span elements that make up the line.
    let line = [];

    // Bit score and total score.
    line.push(
      `Score: ${Utils.inTwoDecimal(hsp.bit_score)} (${hsp.score}), `
    );

    // E value
    line.push("E value: ");
    line.push(Utils.inExponential(hsp.evalue));
    line.push(", ");

    // Identity
    line.push([
      `Identity: ${Utils.inFraction(
        hsp.identity,
        hsp.length
      )} (${Utils.inPercentage(hsp.identity, hsp.length)}), `,
    ]);

    // Positives (for protein alignment).
    if (
      props.algorithm === "blastp" ||
      props.algorithm === "blastx" ||
      props.algorithm === "tblastn" ||
      props.algorithm === "tblastx"
    ) {
      line.push(
        `Positives: ${Utils.inFraction(
          hsp.positives,
          hsp.length
        )} (${Utils.inPercentage(hsp.positives, hsp.length)}), `
      );
    }

    // Gaps
    line.push(
      `Gaps: ${Utils.inFraction(
        hsp.gaps,
        hsp.length
      )} (${Utils.inPercentage(hsp.gaps, hsp.length)})`
    );

    // Query coverage
    //line.push(`Query coverage: ${this.hsp.qcovhsp}%, `)

    switch (props.algorithm) {
      case "tblastx":
        line.push(
          `, Frame: ${Utils.inFraction(hsp.qframe, hsp.sframe)}`
        );
        break;
      case "blastn":
        line.push(
          `, Strand: ${hsp.qframe > 0 ? "+" : "-"} / ${
            hsp.sframe > 0 ? "+" : "-"
          }`
        );
        break;
      case "blastx":
        line.push(`, Query Frame: ${hsp.qframe}`);
        break;
      case "tblastn":
        line.push(`, Hit Frame: ${hsp.sframe}`);
        break;
    }

    return line;
  }


  // Width of the coordinate part of hsp lines. Essentially the length of
  // the largest coordinate.
  const hspLinesWidth = () => {
    return _.max(
      _.map(
        [hsp.qstart, hsp.qend, hsp.sstart, hsp.send],
        (n) => {
          return n.toString().length;
        }
      )
    );
  }

  /**
   * Returns array of pre tags containing the three query, middle, and subject
   * lines that together comprise one 'rendered line' of HSP.
   */
  const hspLines = () => {
    // Space reserved for showing coordinates
    const width = hspLinesWidth();

    // Number of residues we can draw per line is the total number of
    // characters we can have in a line minus space required to show left
    // and right coordinates minus 10 characters reserved for displaying
    // the words Query, Subject and three blank spaces per line.
    const adjustedLineWidth = chars - 2 * width - 10;

    // Number of lines of pairwise-alignment (i.e., each line consists of 3
    // lines). We draw as many pre tags.
    const lines = Math.ceil(hsp.length / adjustedLineWidth);

    let pp = [];
    let nqseq = getNqseq();
    let nsseq = getNsseq();
    for (let i = 1; i <= lines; i++) {
      let seq_start_index = adjustedLineWidth * (i - 1);
      let seq_stop_index = seq_start_index + adjustedLineWidth;

      let lqstart = nqseq;
      let lqseq = hsp.qseq.slice(seq_start_index, seq_stop_index);
      let lqend =
        nqseq +
        (lqseq.length - lqseq.split("-").length) *
          qframe_unit() *
          qframe_sign();
      nqseq = lqend + qframe_unit() * qframe_sign();

      let lmseq = hsp.midline.slice(seq_start_index, seq_stop_index);

      let lsstart = nsseq;
      let lsseq = hsp.sseq.slice(seq_start_index, seq_stop_index);
      let lsend =
        nsseq +
        (lsseq.length - lsseq.split("-").length) *
          sframe_unit() *
          sframe_sign();
      nsseq = lsend + sframe_unit() * sframe_sign();

      pp.push(
        <pre key={hsp.number + "," + i} className="pre-item m-0 p-0 rounded-none border-0 bg-inherit whitespace-pre-wrap break-keep mt-1 tracking-wider">
          <span className="text-gray-500">
            {`Query   ${formatCoords(lqstart, width)} `}
          </span>
          <span>{lqseq}</span>
          <span className="text-gray-500">{` ${lqend}`}</span>
          <br />
          <span className="text-gray-500">
            {`${formatCoords("", width + 8)} `}
          </span>
          <span>{lmseq}</span>
          <br />
          <span className="text-gray-500">
            {`Subject ${formatCoords(lsstart, width)} `}
          </span>
          <span>{lsseq}</span>
          <span className="text-gray-500">{` ${lsend}`}</span>
          <br />
        </pre>
      );
    }

    return pp;
  }


  // Alignment start coordinate for query sequence.
  //
  // This will be qstart or qend depending on the direction in which the
  // (translated) query sequence aligned.
  const getNqseq = () => {
    switch (props.algorithm) {
      case "blastp":
      case "blastx":
      case "tblastn":
      case "tblastx":
        return hsp.qframe >= 0 ? hsp.qstart : hsp.qend;
      case "blastn":
        // BLASTN is a bit weird in that, no matter which direction the query
        // sequence aligned in, qstart is taken as alignment start coordinate
        // for query.
        return hsp.qstart;
    }
  }

  // Alignment start coordinate for subject sequence.
  //
  // This will be sstart or send depending on the direction in which the
  // (translated) subject sequence aligned.
  const getNsseq = () => {
    switch (props.algorithm) {
      case "blastp":
      case "blastx":
      case "tblastn":
      case "tblastx":
        return hsp.sframe >= 0 ? hsp.sstart : hsp.send;
      case "blastn":
        // BLASTN is a bit weird in that, no matter which direction the
        // subject sequence aligned in, sstart is taken as alignment
        // start coordinate for subject.
        return hsp.sstart;
    }
  }

  // Jump in query coordinate.
  //
  // Roughly,
  //
  //   qend = qstart + n * qframe_unit
  //
  // This will be 1 or 3 depending on whether the query sequence was
  // translated or not.
  const qframe_unit = () => {
    switch (props.algorithm) {
      case "blastp":
      case "blastn":
      case "tblastn":
        return 1;
      case "blastx":
      // _Translated_ nucleotide query against protein database.
      case "tblastx":
        // _Translated_ nucleotide query against translated
        // nucleotide database.
        return 3;
    }
  }

  // Jump in subject coordinate.
  //
  // Roughly,
  //
  //   send = sstart + n * sframe_unit
  //
  // This will be 1 or 3 depending on whether the subject sequence was
  // translated or not.
  const sframe_unit = () => {
    switch (props.algorithm) {
      case "blastp":
      case "blastx":
      case "blastn":
        return 1;
      case "tblastn":
        // Protein query against _translated_ nucleotide database.
        return 3;
      case "tblastx":
        // Translated nucleotide query against _translated_
        // nucleotide database.
        return 3;
    }
  }

  // If we should add or subtract qframe_unit from qstart to arrive at qend.
  //
  // Roughly,
  //
  //   qend = qstart + (qframe_sign) * n * qframe_unit
  //
  // This will be +1 or -1, depending on the direction in which the
  // (translated) query sequence aligned.
  const qframe_sign = () => {
    return hsp.qframe >= 0 ? 1 : -1;
  }

  // If we should add or subtract sframe_unit from sstart to arrive at send.
  //
  // Roughly,
  //
  //   send = sstart + (sframe_sign) * n * sframe_unit
  //
  // This will be +1 or -1, depending on the direction in which the
  // (translated) subject sequence aligned.
  const sframe_sign = () => {
    return hsp.sframe >= 0 ? 1 : -1;
  }

  /**
   * Pad given coord with ' ' till its length == width. Returns undefined if
   * width is not supplied.
   */
  const formatCoords = (coord, width) => {
    if (width) {
      let padding = width - coord.toString().length;
      return Array(padding + 1)
        .join(" ")
        .concat([coord]);
    }
  }

  const spanCoords = (text) => {
    return <span className="text-gray-700">{text}</span>;
  }

  return (
    <div
      className="hsp pt-px pb-5 border-l-2 border-transparent pl-1 -ml-1"
      id={domID()}
      ref={hspRef}
      data-parent-hit={hitDOM_ID()}
    >
      <p className="m-0 p-0 rounded-none border-0 bg-inherit whitespace-pre-wrap break-keep text-sm text-neutral-500 font-semibold tracking-wide">
        {props.showHSPNumbers &&
          `${Helpers.toLetters(hsp.number)}. `}
        {hspStats().map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </p>
      {hspLines()}
    </div>
  );
}

// Redraw if window resized.
// $(window).resize(
//   _.debounce(function () {
//     _.each(HSPComponents, (comp) => {
//       comp.draw();
//     });
//   }, 100)
// );
