import React, { useEffect, useRef } from "react";
import Vex from "vexflow";

const PitchSheet = ({ time, originalPitch, recordedPitch }) => {
  const containerRef = useRef(null);
  const VF = Vex.Flow;

  const hzToNoteName = (hz) => {
    const A4 = 440;
    const noteNames = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    const semitone = 12 * Math.log2(hz / A4);
    const midi = Math.round(semitone + 69);
    const note = noteNames[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${note}/${octave}`;
  };

  const getDuration = (diff) => {
    if (diff <= 0.25) return "16";
    if (diff <= 0.5) return "8";
    if (diff <= 1) return "4";
    return "2";
  };

  const convertToNotes = (pitchArray, color) => {
    return pitchArray
      .map((hz, i) => {
        if (!hz) return null;
        const note = hzToNoteName(hz);
        const diff = time[i + 1] ? time[i + 1] - time[i] : 0.5;
        const duration = getDuration(diff);

        return new VF.StaveNote({
          keys: [note.replace("#", "#/")],
          duration,
          clef: "treble",
        }).setStyle({ fillStyle: color, strokeStyle: color });
      })
      .filter(Boolean);
  };

  useEffect(() => {
    containerRef.current.innerHTML = ""; // reset
    const renderer = new VF.Renderer(
      containerRef.current,
      VF.Renderer.Backends.SVG
    );
    renderer.resize(1000, 200);
    const context = renderer.getContext();
    const stave = new VF.Stave(10, 40, 900);
    stave.addClef("treble").addTimeSignature("4/4");
    stave.setContext(context).draw();

    const originalNotes = convertToNotes(originalPitch, "black");
    const recordedNotes = convertToNotes(recordedPitch, "#9B7ED8");

    const voice1 = new VF.Voice({
      num_beats: 4 * Math.ceil(time.length / 4),
      beat_value: 4,
    });
    voice1.addTickables(originalNotes);

    const voice2 = new VF.Voice({
      num_beats: 4 * Math.ceil(time.length / 4),
      beat_value: 4,
    });
    voice2.addTickables(recordedNotes);

    new VF.Formatter()
      .joinVoices([voice1, voice2])
      .format([voice1, voice2], 800);
    voice1.draw(context, stave);
    voice2.draw(context, stave);
  }, [originalPitch, recordedPitch, time]);

  return <div ref={containerRef}></div>;
};

export default PitchSheet;
