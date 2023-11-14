import Grid from "@mui/material/Unstable_Grid2";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Prayer from "./Prayer";

import axios from "axios";
import { useState, useEffect, useMemo } from "react";

import moment from "moment";
import "moment/dist/locale/ar-dz";
moment.locale("ar");

const MainContent = () => {
  // STATES
  const [timings, setTimings] = useState({
    Fajr: "04:49",
    Dhuhr: "11:39",
    Asr: "14:40",
    Maghrib: "16:59",
    Isha: "18:19",
  });

  const [selectedCity, setSelectedCity] = useState({
    displayName: "القاهرة",
    apiName: "Cairo",
  });

  const [remainingTime, setRemainingTime] = useState("");
  const [nextPrayerIndex, setNextPrayerIndex] = useState(2);
  const prayersArray = useMemo(() => {
    return [
      { key: "Fajr", displayName: "الفجر" },
      { key: "Dhuhr", displayName: "الظهر" },
      { key: "Asr", displayName: "العصر" },
      { key: "Maghrib", displayName: "المغرب" },
      { key: "Isha", displayName: "العشاء" },
    ];
  }, []);

  const avilableCities = [
    { apiName: "Cairo", displayName: "القاهرة" },
    { apiName: "Giza", displayName: "الجيزة" },
    { apiName: "Alexandria", displayName: "الاسكندرية" },
  ];

  const [today, setToday] = useState("");

  useEffect(() => {
    const getTimings = async () => {
      const response = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?country=EG&city=${selectedCity.apiName}`
      );
      setTimings(response.data.data.timings);
    };
    getTimings();
  }, [selectedCity]);

  useEffect(() => {
    const setupCountdownTimer = () => {
      const momentNow = moment();
      let prayerIndex = 2;

      if (
        momentNow.isAfter(moment(timings["Fajr"], "hh:mm")) &&
        momentNow.isBefore(moment(timings["Dhuhr"], "hh:mm"))
      ) {
        prayerIndex = 1;
      } else if (
        momentNow.isAfter(moment(timings["Dhuhr"], "hh:mm")) &&
        momentNow.isBefore(moment(timings["Asr"], "hh:mm"))
      ) {
        prayerIndex = 2;
      } else if (
        momentNow.isAfter(moment(timings["Asr"], "hh:mm")) &&
        momentNow.isBefore(moment(timings["Maghrib"], "hh:mm"))
      ) {
        prayerIndex = 3;
      } else if (
        momentNow.isAfter(moment(timings["Maghrib"], "hh:mm")) &&
        momentNow.isBefore(moment(timings["Isha"], "hh:mm"))
      ) {
        prayerIndex = 4;
      } else {
        prayerIndex = 0;
      }

      setNextPrayerIndex(prayerIndex);

      // now after knowing what the next prayer is, we can setup the countdown timer by getting the prayer's time
      const nextPrayerObject = prayersArray[prayerIndex];
      const nextPrayerTime = timings[nextPrayerObject.key];
      const nextPrayerTimeMoment = moment(nextPrayerTime, "hh:mm");

      let remainingTime = moment(nextPrayerTime, "hh:mm").diff(momentNow);

      if (remainingTime < 0) {
        const midnightDiff = moment("23:59:59", "hh:mm:ss").diff(momentNow);
        const fajrToMidnightDiff = nextPrayerTimeMoment.diff(
          moment("00:00:00", "hh:mm:ss")
        );

        const totalDiffernce = midnightDiff + fajrToMidnightDiff;

        remainingTime = totalDiffernce;
      }

      const durationRemainingTime = moment.duration(remainingTime);
      setRemainingTime(
        `${durationRemainingTime.seconds()} : ${durationRemainingTime.minutes()} : ${durationRemainingTime.hours()}`
      );
    };

    let interval = setInterval(() => {
      setupCountdownTimer();
    }, 1000);

    const t = moment();
    setToday(t.format("MMM Do YYYY | h:mm"));

    return () => {
      clearInterval(interval);
    };
  }, [timings, prayersArray]);

  const handleCityChange = (e) => {
    const cityObject = avilableCities.find((city) => {
      return city.apiName === e.target.value;
    });
    setSelectedCity(cityObject);
  };

  return (
    <>
      {/* TOP ROW */}
      <Grid container>
        <Grid xs={6}>
          <div style={{ color: "white", textAlign: "center" }}>
            <h2>{today}</h2>
            <h1>{selectedCity.displayName}</h1>
          </div>
        </Grid>

        <Grid xs={6}>
          <div style={{ color: "white", textAlign: "center" }}>
            <h2>متبقي حتى صلاة {prayersArray[nextPrayerIndex].displayName}</h2>
            <h1>{remainingTime}</h1>
          </div>
        </Grid>
      </Grid>
      {/* TOP ROW */}

      <Divider style={{ borderColor: "white", opacity: "0.1" }} />

      {/* PRAYERS CARDS */}
      <Stack
        direction="row"
        justifyContent={"space-around"}
        style={{ marginTop: "50px" }}
      >
        <Prayer
          name="الفجر"
          time={timings.Fajr}
          image="https://wepik.com/api/image/ai/9a07baa7-b49b-4f6b-99fb-2d2b908800c2"
        />
        <Prayer
          name="الظهر"
          time={timings.Dhuhr}
          image="https://wepik.com/api/image/ai/9a07bb45-6a42-4145-b6aa-2470408a2921"
        />
        <Prayer
          name="العصر"
          time={timings.Asr}
          image="https://wepik.com/api/image/ai/9a07bb90-1edc-410f-a29a-d260a7751acf"
        />
        <Prayer
          name="المغرب"
          time={timings.Sunset}
          image="https://wepik.com/api/image/ai/9a07bbe3-4dd1-43b4-942e-1b2597d4e1b5"
        />
        <Prayer
          name="العشاء"
          time={timings.Isha}
          image="https://wepik.com/api/image/ai/9a07bc25-1200-4873-8743-1c370e9eff4d"
        />
      </Stack>
      {/* PRAYERS CARDS */}

      {/* SELECT CITY */}
      <Stack
        direction="row"
        justifyContent={"center"}
        style={{ marginTop: "40px" }}
      >
        <FormControl style={{ width: "20%" }}>
          <InputLabel id="demo-simple-select-label">
            <span style={{ color: "white" }}>المدينة</span>
          </InputLabel>
          <Select
            style={{ color: "white" }}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="city"
            value={selectedCity.apiName}
            onChange={handleCityChange}
          >
            {avilableCities.map((city) => {
              return (
                <MenuItem value={city.apiName} key={city.apiName}>
                  {city.displayName}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Stack>
    </>
  );
};

export default MainContent;
