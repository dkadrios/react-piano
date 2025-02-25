import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import MidiNumbers from './MidiNumbers';

const middleC = 60;

class Key extends React.Component {
  static propTypes = {
    midiNumber: PropTypes.number.isRequired,
    naturalKeyWidth: PropTypes.number.isRequired, // Width as a ratio between 0 and 1
    gliss: PropTypes.bool.isRequired,
    useTouchEvents: PropTypes.bool.isRequired,
    accidental: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    onKeyMouseEnter: PropTypes.func,
    onKeyMouseLeave: PropTypes.func,
    onPlayNoteInput: PropTypes.func.isRequired,
    onStopNoteInput: PropTypes.func.isRequired,
    accidentalWidthRatio: PropTypes.number.isRequired,
    pitchPositions: PropTypes.object.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    accidentalWidthRatio: 0.65,
    onKeyMouseEnter: undefined,
    onKeyMouseLeave: undefined,
    pitchPositions: {
      C: 0,
      Db: 0.672,
      D: 1,
      Eb: 1.672,
      E: 2,
      F: 3,
      Gb: 3.672,
      G: 4,
      Ab: 4.672,
      A: 5,
      Bb: 5.672,
      B: 6,
    },
  };

  onPlayNoteInput = () => {
    this.props.onPlayNoteInput(this.props.midiNumber);
  };

  onStopNoteInput = () => {
    this.props.onStopNoteInput(this.props.midiNumber);
    if (this.props.onKeyMouseLeave) {
      this.props.onKeyMouseLeave(this.props.midiNumber)
    }
  };

  // Key position is represented by the number of natural key widths from the left
  getAbsoluteKeyPosition(midiNumber) {
    const OCTAVE_WIDTH = 7;
    const { octave, pitchName } = MidiNumbers.getAttributes(midiNumber);
    const pitchPosition = this.props.pitchPositions[pitchName];
    const octavePosition = OCTAVE_WIDTH * octave;
    return pitchPosition + octavePosition;
  }

  getRelativeKeyPosition(midiNumber) {
    return (
      this.getAbsoluteKeyPosition(midiNumber) -
      this.getAbsoluteKeyPosition(this.props.noteRange.first)
    );
  }

  render() {
    const {
      naturalKeyWidth,
      accidentalWidthRatio,
      midiNumber,
      gliss,
      useTouchEvents,
      accidental,
      active,
      disabled,
      children,
    } = this.props;

    const left = accidental
      ? ratioToPercentage(this.getRelativeKeyPosition(midiNumber) * naturalKeyWidth)
      : ratioToPercentage(this.getRelativeKeyPosition(midiNumber) * naturalKeyWidth)

    const width = ratioToPercentage(
      accidental ? accidentalWidthRatio * naturalKeyWidth : naturalKeyWidth,
    )

    // Need to conditionally include/exclude handlers based on useTouchEvents,
    // because otherwise mobile taps double fire events.
    return (
      <div
        data-midinumber={midiNumber}
        className={classNames('ReactPiano__Key', {
          'ReactPiano__Key--accidental': accidental,
          'ReactPiano__Key--natural': !accidental,
          'ReactPiano__Key--disabled': disabled,
          'ReactPiano__Key--active': active,
          'ReactPiano__Key--middleC': midiNumber === middleC,
        })}
        style={{
          left,
          width,
        }}
        onDoubleClick={() => {
          if (this.props.onDoubleClick) {
            this.props.onDoubleClick(midiNumber)
          }
        }}
        onMouseDown={useTouchEvents ? null : this.onPlayNoteInput}
        onMouseUp={() => {
          if (this.props.onClick) {
            this.props.onClick(midiNumber)
          }
          if (!useTouchEvents) {
            this.onStopNoteInput()
          }
        }
        }
        onMouseEnter={() => {
          if (this.props.onKeyMouseEnter) {
            this.props.onKeyMouseEnter({
              accidental,
              left,
              midiNumber,
              width,
            })
          }
          if(gliss) this.onPlayNoteInput()
        }}
        onMouseLeave={this.onStopNoteInput}
        onTouchStart={useTouchEvents ? this.onPlayNoteInput : null}
        onTouchCancel={useTouchEvents ? this.onStopNoteInput : null}
        onTouchEnd={useTouchEvents ? this.onStopNoteInput : null}
      >
        <div className="ReactPiano__NoteLabelContainer">{children}</div>
      </div>
    );
  }
}

function ratioToPercentage(ratio) {
  return `${ratio * 100}%`;
}

export default Key;
