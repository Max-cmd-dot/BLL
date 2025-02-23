import styles from "./styles.module.css";
import { formatDate } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { changeRoute } from "../../reduxStore";
import Cookies from "js-cookie";

const apiUrl = process.env.REACT_APP_API_URL;
const Calendar = () => {
  const groupId = Cookies.get("groupId");
  let [list2, setList2] = useState([]);
  const state = {
    weekendsVisible: true,
    currentEvents: [],
  };
  const currentPage = useSelector((state) => state.currentPage);
  const dispatch = useDispatch();
  // Use another effect hook to dispatch changeRoute when the component mounts
  useEffect(() => {
    dispatch(changeRoute("/forecast"));
  }, [dispatch]); // Re-run the effect if dispatch changes

  function renderEventContent(eventInfo) {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </>
    );
  }
  useEffect(() => {
    if (currentPage === "/calendar") {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/api/notification/latestdata/notifications?groupId=${groupId}`
          );
          const valuesArr = response.data.map((item) => ({
            message: item.message,
            time: new Date(item.time).toISOString(), // Convert to ISO string
            group: item.group,
            timenow: new Date().getTime(),
          }));
          setList2(valuesArr);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [groupId, currentPage]);
  const events = [
    {
      title: ": Bereich 1 gießen",
      category: "time",
      start: "2023-011-26T12:00:00",
      end: "2023-11-26T13:30:00",
    },
    {
      title: ": Bereich 2 Pflanzen",
      category: "time",
      start: "2023-11-24T15:00:00",
      end: "2023-11-27T15:30:00",
      backgroundColor: "darkblue",
    },
    {
      title: ": Bereich 1 Pflanzen",
      category: "time",
      start: "2023-11-07T15:00:00",
      end: "2023-11-13T15:30:00",
      backgroundColor: "orange",
    },
    {
      title: ": Bereich 1 ernten",
      category: "time",
      start: "2023-11-04T15:00:00",
      end: "2023-11-06T15:30:00",
    },
    ...list2
      .filter((item) => item.ignore !== "true")
      .map((item) => ({
        title: ": " + item.message,
        category: "time",
        start: item.time,
        end: new Date(
          new Date(item.time).getTime() + 60 * 60 * 1000
        ).toISOString(),
        backgroundColor: "orange",
      })),
  ];
  const handleDateSelect = (selectInfo) => {
    let title = prompt("Please enter a new title for your event");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  };
  const handleEventClick = (clickInfo) => {
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    }
  };

  const handleEvents = (events) => {
    setState({
      currentEvents: events,
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Calendar</h1>
      <div className={styles.box}>
        <div className={styles.calendar}>
          <div className={styles.space}></div>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            events={events}
            weekends={state.weekendsVisible}
            eventContent={renderEventContent}
            select={handleDateSelect}
            eventClick={handleEventClick}
          />
          <div className={styles.space}></div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
