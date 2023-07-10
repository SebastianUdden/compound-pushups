import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { greetings, peppTalk } from "../constants/greetings";

interface TimeValue {
  count: number;
  date: string;
}
interface WorkoutProps {
  "push-ups"?: Array<TimeValue>;
}

const COMPOUND_WORKOUT_DATA = "compound-workout-0001";
const ONE_PERCENT_INCREASE = 1.01;
const ONE_PERCENT_DECREASE = 0.99;
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
  let c = 0;
  values.forEach((v, i) => {
    const dateOffset = getDateOffset(i);
    if (dateOffset === v.date) {
      c += 1;
    }
  });
  return c;
};

const Workout = () => {
  const workoutData = JSON.parse(
    localStorage.getItem(COMPOUND_WORKOUT_DATA) || "{}"
  );
  const bgColor = "#282c34";
  const isLoading = useRef(true);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [add, setAdd] = useState("");
  const [remove, setRemove] = useState("");
  const [greeting, setGreeting] = useState<any>(false);
  const [complete, setComplete] = useState(false);
  const [continueNow, setContinueNow] = useState(false);
  const [count, setCount] = useState(0);
  const [type, setType] = useState((workoutData?.types || TYPES)[0]);
  const [types, setTypes] = useState(
    workoutData?.types ? Object.keys(workoutData?.types) : TYPES
  );
  const [currentStreak, setCurrentStreak] = useState(0);
  const text = "Today your challenge is";

  const onWorkoutDataChange = (property: string, value: any) => {
    const workout = workoutData;
    const newWorkoutData = { ...workout, [property]: value };
    localStorage.setItem(COMPOUND_WORKOUT_DATA, JSON.stringify(newWorkoutData));
  };

  const handleSelectType = (type: string) => {
    setType(type);
    onWorkoutDataChange("selectedType", type);
  };

  const handleAdd = () => {
    const oldWorkout = workoutData;
    localStorage.setItem(
      COMPOUND_WORKOUT_DATA,
      JSON.stringify({
        ...oldWorkout,
        types: { ...oldWorkout.types, [add]: [] },
      })
    );
    setTypes([...types, add]);
    setShowAddWorkout(false);
  };
  const handleRemove = () => {
    const oldWorkout = JSON.parse(
      localStorage.getItem(COMPOUND_WORKOUT_DATA) || "{}"
    );
    const { [remove]: value, ...someTypes } = oldWorkout.types;
    localStorage.setItem(
      COMPOUND_WORKOUT_DATA,
      JSON.stringify({
        ...oldWorkout,
        types: someTypes,
      })
    );
    const newTypes = [...types.filter((t) => t !== remove)];
    setTypes(newTypes);
    setType(newTypes[0]);
    setShowAddWorkout(false);
  };

  const handleDone = () => {
    if (complete && !continueNow) return;
    setComplete(true);
    const oldWorkout = JSON.parse(
      localStorage.getItem(COMPOUND_WORKOUT_DATA) || "{}"
    );
    const percentageCount = count * ONE_PERCENT_INCREASE;
    const newCount =
      percentageCount > Math.round(count) + 1 ? percentageCount : count + 1;
    const now = new Date();
    const todaysDate = `${now.getFullYear()}-${month(now.getMonth())}-${date(
      now.getDate()
    )}`;
    const newType = { count: newCount, date: todaysDate };
    const typeValues = oldWorkout.types[type] || [];
    if (
      !continueNow &&
      typeValues.length &&
      typeValues[0].date === getDateOffset(0)
    )
      return;
    setCount(newCount);
    setContinueNow(false);
    const newTypeValues = [newType, ...typeValues];
    const workout: WorkoutProps = {
      ...oldWorkout,
      selectedType: type,
      dayCompleted: new Date(),
      types: { ...oldWorkout.types, [type]: newTypeValues },
    };
    localStorage.setItem(COMPOUND_WORKOUT_DATA, JSON.stringify(workout));
    setCurrentStreak(getCurrentStreak(newTypeValues));
  };

  const handleFail = () => {
    if (!complete) return;
    setComplete(true);
    const oldWorkout = JSON.parse(
      localStorage.getItem(COMPOUND_WORKOUT_DATA) || "{}"
    );
    const percentageCount = count * ONE_PERCENT_DECREASE;
    const newCount =
      percentageCount < Math.round(count) - 1 ? percentageCount : count - 1;
    const now = new Date();
    const todaysDate = `${now.getFullYear()}-${month(now.getMonth())}-${date(
      now.getDate()
    )}`;
    const newType = { count: newCount, date: todaysDate };
    const typeValues = oldWorkout.types[type] || [];
    if (
      !continueNow &&
      typeValues.length &&
      typeValues[0].date === getDateOffset(0)
    )
      return;
    setCount(newCount);
    setContinueNow(false);
    const newTypeValues = [newType, ...typeValues];
    const workout: WorkoutProps = {
      ...oldWorkout,
      selectedType: type,
      dayCompleted: new Date(),
      types: { ...oldWorkout.types, [type]: newTypeValues },
    };
    localStorage.setItem(COMPOUND_WORKOUT_DATA, JSON.stringify(workout));
    setCurrentStreak(0);
  };

  useEffect(() => {
    const workout = JSON.parse(
      localStorage.getItem(COMPOUND_WORKOUT_DATA) || "{}"
    );
    if (!workout.selectedType) {
      let newWorkout: any = { types: {} };
      types.forEach((t: any) => (newWorkout.types[t] = []));
      newWorkout.selectedType = "push-up";
      localStorage.setItem(COMPOUND_WORKOUT_DATA, JSON.stringify(newWorkout));
    }
    setType(workout?.selectedType || "push-up");
    const typeValues =
      (workout?.types && workout.types[workout?.selectedType]) || [];
    setCurrentStreak(getCurrentStreak(typeValues));

    const lastValue = typeValues[0];
    const lastCount = lastValue?.count || 1;
    const percentageCount = lastCount * ONE_PERCENT_INCREASE;
    const newCount =
      percentageCount > Math.round(lastCount) + 1 ? percentageCount : lastCount;
    setCount(newCount);
    if (new Date(workout.dayCompleted).getDate() === new Date().getDate()) {
      setComplete(true);
      isLoading.current = false;
      return;
    }
    setGreeting(getRandom(greetings));
    isLoading.current = false;
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!type) return;
    const oldWorkout = JSON.parse(
      localStorage.getItem(COMPOUND_WORKOUT_DATA) || "{}"
    );
    const oldType = oldWorkout[type] || [];
    const lastValue = oldType[0];
    setComplete(lastValue ? lastValue.date === getDateOffset(0) : false);
    const typeValues = oldWorkout.types[type] || [];
    setCount(typeValues[0]?.count || 1);
    setCurrentStreak(getCurrentStreak(typeValues));
  }, [type]);

  const typeIndex = types.findIndex((t: any) => t === type);
  const leftIndex = typeIndex === 0 ? types.length - 1 : typeIndex - 1;
  const rightIndex = typeIndex + 1 === types.length ? 0 : typeIndex + 1;

  if (isLoading.current) return <></>;
  return (
    <Wrapper bgColor={bgColor}>
      {showAddWorkout && (
        <AddWorkout>
          <div>
            <Emphasized>Add</Emphasized>
            <Text>Write the name of the workout you wish to add.</Text>
            <Row>
              <Input
                value={add}
                onChange={(e) => setAdd(e.target.value)}
                placeholder="E.g push-ups"
              />
              <Button onClick={handleAdd}>Add</Button>
            </Row>
            <Emphasized>Delete</Emphasized>
            <Text>Write the name of the workout you wish to delete.</Text>
            <Row>
              <Input
                value={remove}
                onChange={(e) => setRemove(e.target.value)}
                placeholder="E.g squats"
              />
              <Button onClick={handleRemove}>Remove</Button>
            </Row>
            <Row>
              <Button onClick={() => setShowAddWorkout(false)}>Cancel</Button>
            </Row>
          </div>
        </AddWorkout>
      )}
      <TopRow>
        <Emphasized>
          <Arrow onClick={() => handleSelectType(types[leftIndex])}>
            &larr;
          </Arrow>
          {type}
          {count > 2 && "s"}
          <Arrow onClick={() => handleSelectType(types[rightIndex])}>
            &rarr;
          </Arrow>
        </Emphasized>
        <Row>
          <Text>
            Daily streak: <strong>{currentStreak}</strong>
          </Text>
        </Row>
      </TopRow>
      <Add onClick={() => setShowAddWorkout(true)}>ADD +</Add>
      {!complete || continueNow ? (
        <>
          <Content>
            <Row>
              <Emphasized>{greeting}</Emphasized>
            </Row>
            <Row>
              <Text>{text}</Text>
            </Row>
            <Row>
              <Count>{Math.round(count)}</Count>
            </Row>
            <Row>
              <Text>
                {type}
                {count > 2 && "s"}
              </Text>
            </Row>
          </Content>
          <Done onClick={handleDone}>Success</Done>
          <Button onClick={handleFail}>Fail</Button>
        </>
      ) : (
        <Content>
          <Row>
            <Text>
              You are done for the day... Tomorrows challenge,{" "}
              {Math.round(count)} reps!
            </Text>
          </Row>
          <Completed>{getRandom(peppTalk)}</Completed>
          <br />
          <Row>
            <Text>Feeling strong?</Text>
          </Row>
          <Button onClick={() => setContinueNow(true)}>Continue now!</Button>
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
const Emphasized = styled.span`
  font-size: 18px;
`;
const Text = styled.span`
  opacity: 0.5;
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
  cursor: pointer;
  :hover {
    color: orange;
  }
`;
const Arrow = styled.button`
  background-color: inherit;
  color: inherit;
  border: none;
  cursor: pointer;
`;
const Button = styled.button`
  background-color: #000;
  color: white;
  border: none;
  padding: 10px;
  margin: 5px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  cursor: pointer;
  :hover {
    color: orange;
    text-decoration: underline;
  }
`;
const Add = styled(Button)`
  position: absolute;
  right: 5px;
  top: 5px;
`;
const AddWorkout = styled.div`
  background-color: #000;
  color: #fff;
  position: sticky;
  height: 100vh;
  width: 100%;
  opacity: 1;
  z-index: 2;
  div {
    margin: 20px;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
  }
  span {
    margin-bottom: 10px;
  }
  button {
    background-color: #222;
    margin-bottom: 30px;
  }
`;
const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
`;

export default Workout;
