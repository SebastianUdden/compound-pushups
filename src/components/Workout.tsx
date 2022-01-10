import { useEffect, useState } from "react";
import styled from "styled-components";
import { greetings, peppTalk } from "../constants/greetings";

interface TimeValue {
  count: number;
  date: string;
}
interface WorkoutProps {
  "push-ups"?: Array<TimeValue>;
}

const ONE_PERCENT_INCREASE = 1.01;
const TYPES = ["push-up", "squat", "sit-up"];

const getRandom = (array: string[]) =>
  array[Math.floor(Math.random() * array.length)];

const month = (value: number) => {
  const addOne = value + 1;
  return addOne > 9 ? addOne : `0${addOne}`;
};

const date = (value: number) => {
  return value > 9 ? value : `0${value}`;
};

const getDateOffset = (value: number) => {
  const now = new Date();
  const dateOffset = 24 * 60 * 60 * 1000 * value;
  now.setTime(now.getTime() - dateOffset);
  const d = date(now.getDate());
  const m = month(now.getMonth());
  const y = now.getFullYear();
  return `${y}-${m}-${d}`;
};

const getCurrentStreak = (values: Array<TimeValue>) => {
  let c = 1;
  values.forEach((v, i) => {
    const dateOffset = getDateOffset(i);
    if (dateOffset === v.date) {
      c += 1;
    }
  });
  return c;
};

const Workout = () => {
  const bgColor = "#282c34";
  const [greeting, setGreeting] = useState<any>(false);
  const [complete, setComplete] = useState(false);
  const [count, setCount] = useState(0);
  const [type, setType] = useState("");
  const [currentStreak, setCurrentStreak] = useState(0);
  const text = "Today you're challenge is";

  useEffect(() => {
    const workout = JSON.parse(localStorage.getItem("workout") || "{}");
    if (!workout) return;
    const typeValues = workout[workout?.selectedType] || [];
    setCurrentStreak(getCurrentStreak(typeValues));

    if (new Date(workout.dayCompleted).getDate() === new Date().getDate()) {
      setComplete(true);
      return;
    }
    const lastValue = typeValues[0];
    setCount((lastValue?.count || 1) * ONE_PERCENT_INCREASE);
    setType(workout?.selectedType || "push-up");
    setGreeting(getRandom(greetings));
  }, []);

  useEffect(() => {
    if (!complete) return;
    const oldWorkout = JSON.parse(localStorage.getItem("workout") || "{}");
    const newCount = count;
    const oldType = oldWorkout[type];
    const now = new Date();
    const todaysDate = `${now.getFullYear()}-${month(now.getMonth())}-${date(
      now.getDate()
    )}`;
    const newType = { count: newCount, date: todaysDate };
    if (!type) return;
    const workout: WorkoutProps = {
      ...oldWorkout,
      selectedType: type,
      [type]: oldType ? [newType, ...oldType] : [newType],
      dayCompleted: new Date(),
    };
    localStorage.setItem("workout", JSON.stringify(workout));
    // eslint-disable-next-line
  }, [complete]);

  useEffect(() => {
    const oldWorkout = JSON.parse(localStorage.getItem("workout") || "{}");
    const oldType = oldWorkout[type] || [];
    const lastValue = oldType[0];
    console.log({ lastValue });
    setComplete(lastValue ? lastValue.date === getDateOffset(0) : false);
  }, [type]);

  const typeIndex = TYPES.findIndex((t) => t === type);
  const leftIndex = typeIndex === 0 ? TYPES.length - 1 : typeIndex - 1;
  const rightIndex = typeIndex + 1 === TYPES.length ? 0 : typeIndex + 1;

  return (
    <Wrapper bgColor={bgColor}>
      <TopRow>
        <Text>
          <Arrow onClick={() => setType(TYPES[leftIndex])}>&larr;</Arrow>
          {type}
          {count > 2 && "s"}
          <Arrow onClick={() => setType(TYPES[rightIndex])}>&rarr;</Arrow>
        </Text>
      </TopRow>
      {!complete ? (
        <>
          <Content>
            <Row>
              <Greeting>{greeting}</Greeting>
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
                {count > 2 && "s"}
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
          <Row>
            <Text>
              Current streak: <strong>{currentStreak}</strong>
            </Text>
          </Row>
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
  margin-top: -150px;
  padding: 20px;
`;
const Row = styled.p`
  font-size: 18px;
  margin: 5px 0;
`;
const TopRow = styled(Row)`
  position: absolute;
  top: 20px;
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
  bottom: 60px;
  font-size: 30px;
  color: inherit;
  background-color: inherit;
  padding: 20px 40px;
`;
const Arrow = styled.button`
  background-color: inherit;
  color: inherit;
  border: none;
`;

export default Workout;
