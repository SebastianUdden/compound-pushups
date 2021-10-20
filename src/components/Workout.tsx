import { useEffect, useState } from "react";
import styled from "styled-components";
import { greetings, peppTalk } from "../constants/greetings";

const getRandom = (array: string[]) =>
  array[Math.floor(Math.random() * array.length)];

const Workout = () => {
  const bgColor = "#282c34";
  const [complete, setComplete] = useState(false);
  const [count, setCount] = useState(0);
  const [type, setType] = useState("");
  const text = "Today you're challenge is";

  useEffect(() => {
    const workout = JSON.parse(localStorage.getItem("workout") || "{}");
    if (!workout) return;
    if (new Date(workout.dayCompleted).getDate() === new Date().getDate()) {
      setComplete(true);
      return;
    }
    setCount(workout[workout?.selectedType] || 1);
    setType(workout?.selectedType || "push-up");
  }, []);

  useEffect(() => {
    if (!complete) return;
    const oldWorkout = JSON.parse(localStorage.getItem("workout") || "{}");
    const workout = {
      ...oldWorkout,
      selectedType: type,
      [type]: count * 1.01,
      dayCompleted: new Date(),
    };
    localStorage.setItem("workout", JSON.stringify(workout));
    // eslint-disable-next-line
  }, [complete]);

  return (
    <Wrapper bgColor={bgColor}>
      {!complete ? (
        <>
          <Content>
            <Row>
              <Greeting>{getRandom(greetings)}</Greeting>
            </Row>
            <Row>
              <Text>{text}</Text>
            </Row>
            <Row>
              <Count>{Math.floor(count)}</Count>
            </Row>
            <Row>
              <Text>
                {type}
                {count > 1 && "s"}
              </Text>
            </Row>
          </Content>
          <Done onClick={() => setComplete(true)}>Done</Done>
        </>
      ) : (
        <Content>
          <Row>
            <Text>You are done for the day...</Text>
          </Row>
          <Completed>{getRandom(peppTalk)}</Completed>
        </Content>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ bgColor: string }>`
  background-color: ${(p) => p.bgColor};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;
const Content = styled.div`
  margin-top: -100px;
  padding: 20px;
`;
const Row = styled.p`
  font-size: 18px;
  margin: 5px 0;
`;
const Count = styled.span`
  font-size: 180px;
`;
const Greeting = styled.span`
  font-size: 18px;
`;
const Text = styled.span`
  opacity: 0.2;
`;
const Completed = styled.p`
  font-size: 30px;
  margin: 0;
`;
const Done = styled.button`
  position: absolute;
  bottom: 40px;
  font-size: 30px;
  color: inherit;
  background-color: inherit;
  padding: 20px 40px;
`;

export default Workout;
