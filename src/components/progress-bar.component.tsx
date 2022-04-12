import React from "react";
import { View, Text } from "react-native";
import styled from "styled-components";

type ProgressProps = {
  bgcolor: string;
  completed: number;
  maxCompleted: number;
  label: string | undefined;
  maxLabel: string | undefined;
  fullLabel: string | undefined;
  showLabel: boolean;
  height: number;
};

const ProgressContainer = styled(View)`
  width: 100%;
  border-radius: 50px;
  margin: 0px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const FillerContainer = styled(View)`
  height: 100%;
  border-radius: 50px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  position: absolute;
  left: 0px;
`;

const ProgressBar = ({ bgcolor, completed, maxCompleted, height, label, maxLabel, fullLabel, showLabel }: ProgressProps) => {
    const containerStyles = {
        height: height,
        backgroundColor: bgcolor + '60',
    }

    const fillerStyles = {
        width: `${completed}%`,
        backgroundColor: bgcolor,
    }

    const labelStyles = {
        paddingHorizontal: 6,
        color: 'white',
        fontFamily: 'Stainless-Regular',
        fontSize: height - 2,
        position: 'absolute',
        right: 0,
    }

    return (
      <ProgressContainer style={containerStyles}>
        <FillerContainer
          style={{ ...fillerStyles, backgroundColor: bgcolor + '80', width: `${maxCompleted}%` }}
        >
          {showLabel && (
            <Text style={labelStyles}>
              {maxLabel ? maxLabel : `${maxCompleted.toFixed(2)}%`}
            </Text>
          )}
        </FillerContainer>
        <FillerContainer style={fillerStyles}>
          {showLabel && (
            <Text style={labelStyles}>
              {label ? label : `${completed.toFixed(2)}%`}
            </Text>
          )}
        </FillerContainer>
        {showLabel && (
          <Text style={labelStyles}>{fullLabel ? fullLabel : "100%"}</Text>
        )}
      </ProgressContainer>
    );
};

ProgressBar.defaultProps = {
    height: 16,
    showLabel: true
}

export default ProgressBar;
