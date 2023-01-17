import React from 'react';
import PropTypes from 'prop-types';
import range from 'just-range';
import classNames from 'classnames';

import Key from './Key';
import MidiNumbers from './MidiNumbers';

class Keyboard extends React.Component {
  static propTypes = {
    noteRange: noteRangePropType,
    activeNotes: PropTypes.arrayOf(PropTypes.number),
    onKeyMouseEnter: PropTypes.func,
    onKeyMouseLeave: PropTypes.func,
    onPlayNoteInput: PropTypes.func.isRequired,
    onStopNoteInput: PropTypes.func.isRequired,
    renderNoteLabel: PropTypes.func.isRequired,
    keyWidthToHeight: PropTypes.number.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    gliss: PropTypes.bool,
    useTouchEvents: PropTypes.bool,
    // If width is not provided, must have fixed width and height in parent container
    width: PropTypes.number,
  };

  static defaultProps = {
    disabled: false,
    gliss: false,
    keyWidthToHeight: 0.33,
    onKeyMouseEnter: undefined,
    onKeyMouseLeave: undefined,
    renderNoteLabel: () => {},
    useTouchEvents: false,
  };

  // Range of midi numbers on keyboard
  getMidiNumbers() {
    return range(this.props.noteRange.first, this.props.noteRange.last + 1);
  }

  getNaturalKeyCount() {
    return this.getMidiNumbers().filter((number) => {
      const { isAccidental } = MidiNumbers.getAttributes(number);
      return !isAccidental;
    }).length;
  }

  // Returns a ratio between 0 and 1
  getNaturalKeyWidth() {
    return 1 / this.getNaturalKeyCount();
  }

  getWidth() {
    return this.props.width ? this.props.width : '100%';
  }

  getHeight() {
    if (!this.props.width) {
      return '100%';
    }
    const keyWidth = this.props.width * this.getNaturalKeyWidth();
    return `${keyWidth / this.props.keyWidthToHeight}px`;
  }

  render() {
    const naturalKeyWidth = this.getNaturalKeyWidth();

    return (
      <div
        className={classNames('ReactPiano__Keyboard', this.props.className)}
        style={{ width: this.getWidth(), height: this.getHeight() }}
      >
        {this.getMidiNumbers().map((midiNumber) => {
          const { note, isAccidental } = MidiNumbers.getAttributes(midiNumber);
          const isActive = !this.props.disabled && this.props.activeNotes.includes(midiNumber);
          return (
            <Key
              accidental={isAccidental}
              active={isActive}
              disabled={this.props.disabled}
              gliss={this.props.gliss}
              key={midiNumber}
              midiNumber={midiNumber}
              naturalKeyWidth={naturalKeyWidth}
              noteRange={this.props.noteRange}
              onClick={this.props.onClick}
              onDoubleClick={this.props.onDoubleClick}
              onKeyMouseEnter={this.props.onKeyMouseEnter}
              onKeyMouseLeave={this.props.onKeyMouseLeave}
              onPlayNoteInput={this.props.onPlayNoteInput}
              onStopNoteInput={this.props.onStopNoteInput}
              useTouchEvents={this.props.useTouchEvents}
            >
              {this.props.disabled
                ? null
                : this.props.renderNoteLabel({
                    isActive,
                    isAccidental,
                    midiNumber,
                  })}
              </Key>
          );
        })}
      </div>
    );
  }
}

function isNaturalMidiNumber(value) {
  if (typeof value !== 'number') {
    return false;
  }
  return MidiNumbers.NATURAL_MIDI_NUMBERS.includes(value);
}

function noteRangePropType(props, propName, componentName) {
  const { first, last } = props[propName];
  if (!first || !last) {
    return new Error(
      `Invalid prop ${propName} supplied to ${componentName}. ${propName} must be an object with .first and .last values.`,
    );
  }
  if (!isNaturalMidiNumber(first) || !isNaturalMidiNumber(last)) {
    return new Error(
      `Invalid prop ${propName} supplied to ${componentName}. ${propName} values must be valid MIDI numbers, and should not be accidentals (sharp or flat notes).`,
    );
  }
  if (first >= last) {
    return new Error(
      `Invalid prop ${propName} supplied to ${componentName}. ${propName}.first must be smaller than ${propName}.last.`,
    );
  }
}

export default Keyboard;
