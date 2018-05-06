import 'react-big-calendar/lib/css/react-big-calendar.css';
import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import xml2js from 'xml2js';

const parser = new xml2js.Parser().parseString
BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

class MyCalendar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myEvents : []
    };
  }

  createDate(str) {
    const [data, time] = str.split(" ");
    const [month, day, year] = data.split("/")
    const [hour, minutes, seconds] = time.split(":")
    return new Date(year, month - 1, day, hour, minutes, seconds);
  }

  componentDidMount() {
    fetch("http://localhost:9200/timetable/_search?q=name:\"15.Б07-пу\"&size=64")
      .then(response => response.json())
      .then(data => {
        const newData = data.hits.hits.filter(element => element._source.recurrenceinfo !== null ).map(elem => {
          parser(elem._source.recurrenceinfo, function (err, result) {
            elem._source.recurrenceinfo = result.RecurrenceInfo.$;
          });
          return elem;
        }).filter(element => typeof element._source.recurrenceinfo.Start !== 'undefined' )
        const events = newData.map(event => {
          console.log(event._source.recurrenceinfo.Start + "  " + event._source.recurrenceinfo.End + "  " + event._source.subject)
          const startTime = event._source.recurrenceinfo.Start;
          return {
            id: event._id,
            title: event._source.subject,
            desc: event._source.locationsdisplaytext + " \n" + event._source.educatorsdisplaytext,
            start: this.createDate(startTime),
            end: this.createDate(startTime.split(" ")[0] + " " + event._source.recurrenceinfo.End.split(" ")[1]),
          }
        })
        this.setState({ myEvents: events })
      });
  }
  render() {
    return (
      <div >
        <BigCalendar
          views={['month', 'week', 'day']}
          defaultView="week"
          step={60}
          events={this.state.myEvents}
          defaultDate={new Date(2017, 8, 4)}
          showMultiDayTimes
        />
      </div>
    );
  }
};

export default MyCalendar;
