import React, { useState, useEffect } from 'react';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  BookOutlined,
  VideoCameraOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  SearchOutlined,
  MessageOutlined,
  SettingOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge, Tooltip, Modal, Form, Input, TimePicker, Select, DatePicker, Popconfirm } from 'antd';
import { Calendar, Clock, Users, Video, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Sidebar from '../../components/layout/Sidebar';
import groupEventService from '../../services/groupEventService';
import groupService from '../../services/groupService';
import useGroupsStore from '../../stores/groupsStore';

const { Option } = Select;
const { TextArea } = Input;

export default function Schedule() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [baseDate, setBaseDate] = useState(dayjs()); // reference date for the calendar range
  const [rangeMode, setRangeMode] = useState('week'); // 'week' | 'month' | '6months' | 'year'
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [form] = Form.useForm();
  const currentGroup = useGroupsStore(state => state.currentGroup);
  const myGroups = useGroupsStore(state => state.myGroups);
  const setCurrentGroup = useGroupsStore(state => state.setCurrentGroup);
  const setMyGroups = useGroupsStore(state => state.setMyGroups);
  const [isCreating, setIsCreating] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Open event detail and try to resolve participant IDs to names using group members
  const openEventDetail = async (ev) => {
    let displayParticipants = ev.participants || [];

    const looksLikeId = (p) => typeof p === 'string' && /[0-9a-fA-F\-]{6,}/.test(p);
    const needResolve = Array.isArray(displayParticipants) && displayParticipants.some(looksLikeId);

    if (needResolve) {
      // try to find group id from event.groupName by matching myGroups
      let groupId = null;
      if (ev.groupName) {
        const g = myGroups.find(gr => String(gr.id) === String(ev.groupName) || gr.groupName === ev.groupName || gr.name === ev.groupName);
        if (g) groupId = g.id;
      }

      if (groupId) {
        try {
          const resp = await groupService.getGroupMembers(groupId);
          const data = resp?.data || resp || {};
          const membersRaw = data?.members || data || [];
          const members = Array.isArray(membersRaw) ? membersRaw : Object.values(membersRaw);
          const map = {};
          members.forEach(m => {
            const id = m.id || m.userId || m.user_id;
            const name = m.username || m.name || (m.email ? m.email.split('@')[0] : id);
            if (id) map[String(id)] = name;
          });

          displayParticipants = displayParticipants.map(p => map[String(p)] || p);
        } catch (err) {
          console.error('Error resolving participant names', err);
        }
      }
    }

    setSelectedEvent({ ...ev, displayParticipants });
    setIsDetailModalOpen(true);
  };

  const handleDeleteEvent = async (ev) => {
    if (!ev) return;
    const eventId = ev.id || ev._id || (ev._id && ev._id.toString());
    try {
      if (eventId) {
        await groupEventService.deleteEvent(eventId);
      }
      setScheduleEvents(prev => prev.filter(e => String(e.id) !== String(eventId)));
      toast.success('Đã xóa sự kiện');
      setIsDetailModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Delete event error', err);
      toast.error(err?.message || 'Xóa sự kiện thất bại');
    }
  };

  // Events loaded from backend
  const [scheduleEvents, setScheduleEvents] = useState([]);

  const timeSlots = [
    '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
    '12 AM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];

  // Fetch events for the visible range (based on baseDate and rangeMode)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // compute start and end ISO strings according to rangeMode
        let start;
        let end;
        if (rangeMode === 'week') {
          const s = dayjs(baseDate).day() === 0 ? dayjs(baseDate).subtract(6, 'day') : dayjs(baseDate).day(1);
          start = s.startOf('day').toISOString();
          end = dayjs(s).add(6, 'day').endOf('day').toISOString();
        } else if (rangeMode === 'month') {
          const s = dayjs(baseDate).startOf('month');
          start = s.startOf('day').toISOString();
          end = s.endOf('month').endOf('day').toISOString();
        } else if (rangeMode === '6months') {
          const s = dayjs(baseDate).startOf('month').subtract(2, 'month');
          start = s.startOf('day').toISOString();
          end = dayjs(s).add(5, 'month').endOf('month').endOf('day').toISOString();
        } else { // year
          const s = dayjs(baseDate).startOf('year');
          start = s.startOf('day').toISOString();
          end = s.endOf('year').endOf('day').toISOString();
        }

        // call backend to get events for user (backend filters by user's groups if no groupId provided)
        const resp = await groupEventService.getEvents({ startDate: start, endDate: end });
        const data = resp?.data || resp || [];

        const eventsArr = Array.isArray(data) ? data : data?.data || [];

        // map backend events to scheduleEvents format
        const mapped = eventsArr.map(ev => {
          const evStart = ev.eventDate || ev.startDate || ev.start || ev.start_time || ev.startAt;
          const evEnd = ev.endDate || ev.end || ev.end_time || ev.endAt;
          const startDt = evStart ? dayjs(evStart) : dayjs();
          const endDt = evEnd ? dayjs(evEnd) : dayjs(startDt).add(1, 'hour');
          const dayIndex = startDt.day() === 0 ? 6 : startDt.day() - 1; // 0=Monday
          // map event type
          const typeMapRev = {
            study_session: 'study',
            meeting: 'meeting',
            presentation: 'presentation',
            exam: 'exam'
          };
          const localType = typeMapRev[ev.eventType] || ev.eventType || 'meeting';

          // participants mapping: try to extract names
          let participants = [];
          if (Array.isArray(ev.participants) && ev.participants.length > 0) {
            participants = ev.participants.map(p => p.name || p.username || p.email || (p.userId || p.id) );
          } else if (Array.isArray(ev.participantIds)) {
            participants = ev.participantIds.map(id => id);
          }

          return {
            id: ev.id || ev._id || Date.now(),
            title: ev.title || ev.name || 'Sự kiện',
            description: ev.description || ev.content || '',
            day: dayIndex,            startIso: startDt.toISOString(),
            endIso: endDt.toISOString(),
            startTime: startDt.format('HH:mm'),
            endTime: endDt.format('HH:mm'),
            type: localType,
            participants,
            color: getEventColor(localType),
            groupName: ev.groupName || ev.group?.groupName || ev.group?.name || ev.groupId || ev.group_id
          };
        });

        setScheduleEvents(mapped);
      } catch (err) {
        console.error('Error fetching calendar events', err);
        toast.error('Không thể tải lịch. Vui lòng thử lại.');
      }
    };

    fetchEvents();
  }, [baseDate, rangeMode, myGroups]);

  // compute weekdays for header based on baseDate and rangeMode
  const computeDaysOfWeek = () => {
    const labels = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    // For week mode, pick the Monday of the baseDate's week; for other modes use baseDate's current week as reference
    let mondayStart;
    if (rangeMode === 'week') {
      mondayStart = dayjs(baseDate).day() === 0 ? dayjs(baseDate).subtract(6, 'day') : dayjs(baseDate).day(1);
    } else {
      // For month/6months/year we still show the week that contains baseDate in header
      mondayStart = dayjs(baseDate).day() === 0 ? dayjs(baseDate).subtract(6, 'day') : dayjs(baseDate).day(1);
    }

    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs(mondayStart).add(i, 'day');
      arr.push({ key: labels[i].toLowerCase().replace(/\s+/g, '-'), label: labels[i], date: d.format('DD/MM'), fullDate: d });
    }
    return arr;
  };

  const daysOfWeek = computeDaysOfWeek();

  useEffect(() => {
    setIsLoaded(true);
    // Fetch user's groups on mount
    const fetchGroups = async () => {
      try {
        const response = await groupService.getMyGroups();
        const groupsData = response?.data || response || [];
        console.log('Fetched my groups:', groupsData);
        // If backend returns object with numeric keys, convert to array
        const groupsArr = Array.isArray(groupsData) ? groupsData : Object.values(groupsData);
        setMyGroups(groupsArr);
        // Optionally set current group to first
        if (groupsArr.length > 0 && !currentGroup) {
          setCurrentGroup(groupsArr[0]);
        }
      } catch (err) {
        console.error('Error fetching my groups', err);
        setMyGroups([]);
      }
    };
    fetchGroups();
  }, []);

  const getEventsForTimeSlot = (day, timeIndex) => {
    // compute visible start/end according to current baseDate and rangeMode
    let visibleStart;
    let visibleEnd;
    if (rangeMode === 'week') {
      const s = dayjs(baseDate).day() === 0 ? dayjs(baseDate).subtract(6, 'day') : dayjs(baseDate).day(1);
      visibleStart = s.startOf('day');
      visibleEnd = dayjs(s).add(6, 'day').endOf('day');
    } else if (rangeMode === 'month') {
      const s = dayjs(baseDate).startOf('month');
      visibleStart = s.startOf('day');
      visibleEnd = s.endOf('month').endOf('day');
    } else if (rangeMode === '6months') {
      const s = dayjs(baseDate).startOf('month').subtract(2, 'month');
      visibleStart = s.startOf('day');
      visibleEnd = dayjs(s).add(5, 'month').endOf('month').endOf('day');
    } else {
      const s = dayjs(baseDate).startOf('year');
      visibleStart = s.startOf('day');
      visibleEnd = s.endOf('year').endOf('day');
    }

    return scheduleEvents.filter(event => {
      // if event has explicit ISO, ensure it falls into the visible range
      if (event.startIso) {
        const evStart = dayjs(event.startIso);
        if (evStart.isBefore(visibleStart) || evStart.isAfter(visibleEnd)) return false;
      }

      const eventStartHour = parseInt(event.startTime.split(':')[0]);
      const eventEndHour = parseInt(event.endTime.split(':')[0]);
      const currentHour = timeIndex + 1;

      return event.day === day && currentHour >= eventStartHour && currentHour < eventEndHour;
    });
  };

  const handleTimeSlotClick = (day, timeIndex) => {
    const sel = { day, timeIndex, time: timeSlots[timeIndex] };
    setSelectedTimeSlot(sel);
    // prefill selected group if exists
    // prefill eventDate based on clicked day within the current baseDate's week/month
    const dayOfWeek = 1 + day; // 1 = Monday
    // set selected date to that weekday in the week that contains baseDate
    const selDate = dayjs(baseDate).day(dayOfWeek);
    form.setFieldsValue({ groupId: currentGroup?.id, eventDate: selDate });
    setIsModalOpen(true);
  };

  // Fetch members when group selection changes in the modal
  const fetchMembersForGroup = async (groupId) => {
    if (!groupId) {
      setGroupMembers([]);
      return;
    }

    try {
      const resp = await groupService.getGroupMembers(groupId);
      const data = resp?.data || resp || {};
      console.log('Fetched group members:', data);
      // backend may wrap members in { members: [...] }
      const membersRaw = data?.members || data || [];

      const members = membersRaw.map((member, idx) => ({
        id: member.id || member.userId || member.user_id,
        userId: member.id || member.userId || member.user_id,
        name: member.username || member.name || (member.email ? member.email.split('@')[0] : 'User'),
        email: member.email,
        avatar: (member.username || 'U').substring(0, 2).toUpperCase(),
        color: `bg-${['purple','blue','green','yellow','pink','indigo','red','cyan'][idx % 8]}-500`,
      }));

      setGroupMembers(members);
    } catch (err) {
      console.error('Error fetching group members', err);
      setGroupMembers([]);
      toast.error('Không thể tải thành viên nhóm.');
    }
  };

  // Watch form changes to detect groupId/groupName change
  const handleFormValuesChange = (changedValues, allValues) => {
    // Support both groupId and groupName
    if (changedValues.groupId !== undefined || changedValues.groupName !== undefined) {
      // Prefer groupName if present
      let groupId = changedValues.groupId;
      if (changedValues.groupName !== undefined) {
        const groupObj = myGroups.find(g => g.groupName === changedValues.groupName);
        groupId = groupObj?.id;
      }
      if (groupId) fetchMembersForGroup(groupId);
      else setGroupMembers([]);
      // Reset participants field when group changes
      form.setFieldsValue({ participants: [] });
    }
  };

  const handleCreateEvent = async (values) => {
    try {
      // Simple time parsing without dayjs
      const startTime = values.timeRange ? values.timeRange[0] : null;
      const endTime = values.timeRange ? values.timeRange[1] : null;
      
      // If user selected a group in the form, use it; otherwise use currently selected group
      // Support different group object shapes: prefer `groupName`, then `name`.
      const selectedGroupName = values.groupName || currentGroup?.groupName || currentGroup?.name;
      const selectedGroupObj = (
        myGroups.find(g => g.groupName === selectedGroupName) ||
        myGroups.find(g => g.name === selectedGroupName) ||
        currentGroup
      );
      const selectedGroupId = selectedGroupObj?.id;

      // Map local type to backend EventType
      const typeMap = {
        meeting: 'meeting',
        study: 'study_session',
        presentation: 'presentation',
        exam: 'exam'
      };

      const startHour = startTime ? startTime.hour() : 9;
      const startMinute = startTime ? startTime.minute() : 0;
      const endHour = endTime ? endTime.hour() : (startHour + 1);
      const endMinute = endTime ? endTime.minute() : 0;

      // Determine base date: prefer user-picked date, otherwise use selectedTimeSlot's week day
      let baseDate;
      if (values.eventDate) {
        baseDate = dayjs(values.eventDate);
      } else if (selectedTimeSlot) {
        const dayOfWeek = 1 + selectedTimeSlot.day; // dayjs: 0 = Sunday, 1 = Monday
        baseDate = dayjs().day(dayOfWeek).add(currentWeek * 7, 'day');
      } else {
        baseDate = dayjs();
      }

      const eventDate = baseDate.hour(startHour).minute(startMinute).second(0).toISOString();
      const endDateIso = baseDate.hour(endHour).minute(endMinute).second(0).toISOString();

      if (selectedGroupId) {
        // CREATE
        setIsCreating(true);
        try {
          const payload = {
            groupId: selectedGroupId,
            title: values.title,
            description: values.description,
            eventType: typeMap[values.type] || typeMap.study,
            eventDate,
            endDate: endDateIso,
            participantIds: values.participants && Array.isArray(values.participants) ? values.participants : undefined,
          };

          const created = await groupEventService.createEvent(payload);
          const body = created?.data || created || {};
          const eventObj = body.data || body;

          const eventDayIndex = values.eventDate
            ? (dayjs(values.eventDate).day() === 0 ? 6 : dayjs(values.eventDate).day() - 1)
            : (selectedTimeSlot ? selectedTimeSlot.day : 0);

          const backendEvent = {
            id: eventObj?.id || Date.now(),
            title: eventObj?.title || values.title,
            description: eventObj?.description || values.description,
            day: eventDayIndex,
            startIso: eventObj?.eventDate || eventDate,
            endIso: eventObj?.endDate || endDateIso,
            startTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
            endTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
            type: values.type,
            participants: Array.isArray(values.participants)
              ? values.participants.map(id => {
                  const member = groupMembers.find(m => m.userId === id);
                  return member ? member.name : id;
                })
              : values.participants ? values.participants.split(',').map(p => p.trim()) : [],
            color: getEventColor(values.type),
            groupName: selectedGroupName,
          };

          setScheduleEvents(prev => [...prev, backendEvent]);
          if (!currentGroup || currentGroup.id !== selectedGroupId) {
            const groupObj = myGroups.find(g => g.id === selectedGroupId);
            if (groupObj) setCurrentGroup(groupObj);
          }

          setIsModalOpen(false);
          form.resetFields();
          toast.success('Đã thêm sự kiện vào nhóm thành công! 📅');
        } catch (err) {
          console.error('Create event error', err);
          toast.error(err?.message || 'Có lỗi xảy ra khi tạo sự kiện trên server!');
        } finally {
          setIsCreating(false);
        }
      } else {
        // Fallback: local-only event
        const eventDayIndex = values.eventDate
          ? (dayjs(values.eventDate).day() === 0 ? 6 : dayjs(values.eventDate).day() - 1)
          : (selectedTimeSlot ? selectedTimeSlot.day : 0);
        const newEvent = {
          id: scheduleEvents.length + 1,
          title: values.title,
          description: values.description,
          day: eventDayIndex,
          startIso: eventDate,
          endIso: endDateIso,
          startTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
          endTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
          type: values.type,
          participants: values.participants ? values.participants.split(',').map(p => p.trim()) : [],
          color: getEventColor(values.type),
          groupName: selectedGroupName,
        };

        setScheduleEvents(prev => [...prev, newEvent]);
        setIsModalOpen(false);
        form.resetFields();
        toast.success('Đã thêm sự kiện (cục bộ) thành công! 📅');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo sự kiện!');
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'study': return 'bg-green-500';
      case 'presentation': return 'bg-purple-500';
      case 'exam': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting': return <Users className="w-3 h-3" />;
      case 'study': return <BookOutlined className="text-xs" />;
      case 'presentation': return <VideoCameraOutlined className="text-xs" />;
      case 'exam': return <EditOutlined className="text-xs" />;
      default: return <CalendarOutlined className="text-xs" />;
    }
  };

  const handlePrevWeek = () => {
    // Move baseDate backwards according to rangeMode
    if (rangeMode === 'week') setBaseDate(d => dayjs(d).subtract(1, 'week'));
    else if (rangeMode === 'month') setBaseDate(d => dayjs(d).subtract(1, 'month'));
    else if (rangeMode === '6months') setBaseDate(d => dayjs(d).subtract(6, 'month'));
    else if (rangeMode === 'year') setBaseDate(d => dayjs(d).subtract(1, 'year'));
  };

  const handleNextWeek = () => {
    if (rangeMode === 'week') setBaseDate(d => dayjs(d).add(1, 'week'));
    else if (rangeMode === 'month') setBaseDate(d => dayjs(d).add(1, 'month'));
    else if (rangeMode === '6months') setBaseDate(d => dayjs(d).add(6, 'month'));
    else if (rangeMode === 'year') setBaseDate(d => dayjs(d).add(1, 'year'));
  };

  return (
    <>
      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}>
        <Sidebar />

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-lg"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <MenuOutlined />
        </button>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <CalendarOutlined className="text-4xl" />
                THỜI KHÓA BIỂU
              </h1>
              <p className="text-white/80">Quản lý lịch học và họp nhóm của bạn</p>
            </motion.div>

            {/* Week Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-4">
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePrevWeek}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  size="large"
                />
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                  <div className="flex items-center gap-3 text-white">
                    <CalendarOutlined className="text-xl" />
                    <span className="font-semibold">
                      {(() => {
                        const start = (() => {
                          if (rangeMode === 'week') {
                            // Monday of baseDate's week
                            const d = dayjs(baseDate).day() === 0 ? dayjs(baseDate).subtract(6, 'day') : dayjs(baseDate).day(1);
                            return d;
                          } else if (rangeMode === 'month') {
                            return dayjs(baseDate).startOf('month');
                          } else if (rangeMode === '6months') {
                            return dayjs(baseDate).startOf('month').subtract(2, 'month');
                          } else { // year
                            return dayjs(baseDate).startOf('year');
                          }
                        })();
                        const end = (() => {
                          if (rangeMode === 'week') return dayjs(start).add(6, 'day');
                          if (rangeMode === 'month') return dayjs(start).endOf('month');
                          if (rangeMode === '6months') return dayjs(start).add(5, 'month').endOf('month');
                          return dayjs(start).endOf('year');
                        })();
                        return `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
                      })()}
                    </span>
                  </div>
                </div>
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNextWeek}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  size="large"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="text-white/80 text-sm">GMT +07</div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    // open modal and prefill default time / group
                      const todayIndex = dayjs().day(); // 0 = Sunday
                      const mappedDay = todayIndex === 0 ? 6 : todayIndex - 1; // 0=Mon
                      setSelectedTimeSlot({ day: mappedDay, timeIndex: 8, time: timeSlots[8] });
                      // prefill eventDate from baseDate's week
                      const selDate = dayjs(baseDate).day(1 + mappedDay);
                      form.setFieldsValue({ groupId: currentGroup?.id, eventDate: selDate });
                      setIsModalOpen(true);
                  }}
                  className="bg-white text-purple-600 border-0 hover:bg-gray-100"
                  size="large"
                >
                  Thêm sự kiện
                </Button>
              </div>
            </motion.div>

            {/* Schedule Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Days Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <div className="grid grid-cols-8 gap-2">
                  <div className="flex items-center justify-center">
                    <ClockCircleOutlined className="text-white text-xl" />
                  </div>
                  {daysOfWeek.map((day, index) => (
                    <motion.div
                      key={day.key}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center text-white"
                    >
                      <div className="font-semibold text-sm">{day.label}</div>
                      <div className="text-xs opacity-80">{day.date}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
                {timeSlots.map((time, timeIndex) => (
                  <div key={timeIndex} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* Time Label */}
                    <div className="bg-purple-50 p-3 text-center border-r border-gray-200">
                      <div className="text-purple-600 font-medium text-sm">{time}</div>
                    </div>
                    
                    {/* Day Cells */}
                    {daysOfWeek.map((day, dayIndex) => {
                      const events = getEventsForTimeSlot(dayIndex, timeIndex);
                      return (
                        <motion.div
                          key={`${dayIndex}-${timeIndex}`}
                          whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.05)' }}
                          className="relative p-2 border-r border-gray-100 min-h-[60px] cursor-pointer"
                          onClick={() => handleTimeSlotClick(dayIndex, timeIndex)}
                        >
                          <AnimatePresence>
                            {events.map((event, eventIndex) => (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                                className={`${event.color} text-white p-2 rounded-lg text-xs mb-1 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEventDetail(event);
                                }}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  {getEventIcon(event.type)}
                                  <span className="font-semibold truncate">{event.title}</span>
                                </div>
                                <div className="text-xs opacity-90">
                                  {event.startTime} - {event.endTime}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <UserOutlined className="text-xs" />
                                  <span>{Array.isArray(event.participants) ? event.participants.length : 0}</span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
            >
              <div className="flex items-center justify-center gap-8 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Họp nhóm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Học nhóm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm">Thuyết trình</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Kiểm tra</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <PlusOutlined className="text-white" />
            </div>
            Tạo sự kiện mới
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        centered
        destroyOnClose
        className="custom-modal"
      >
        <div className="pt-6">
          <Form
            form={form}
            onFinish={handleCreateEvent}
            onValuesChange={(changedValues, allValues) => handleFormValuesChange(changedValues, allValues)}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="title"
              label={<span className="text-gray-700 font-medium">Tiêu đề sự kiện</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
            >
              <Input
                placeholder="Nhập tiêu đề sự kiện"
                prefix={<CalendarOutlined className="text-gray-400" />}
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-gray-700 font-medium">Mô tả</span>}
            >
              <TextArea
                placeholder="Mô tả chi tiết về sự kiện"
                rows={3}
                className="rounded-xl"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="groupName"
                label={<span className="text-gray-700 font-medium">Nhóm</span>}
              >
                <Select placeholder="Chọn nhóm (mặc định là nhóm hiện tại)" className="rounded-xl">
                  {myGroups && myGroups.length > 0 ? (
                    myGroups.map(g => (
                      <Option key={g.id} value={g.groupName}>{g.groupName}</Option>
                    ))
                  ) : (
                    <Option key="none" value="">Không có nhóm</Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                name="type"
                label={<span className="text-gray-700 font-medium">Loại sự kiện</span>}
                rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện!' }]}
              >
                <Select placeholder="Chọn loại sự kiện" className="rounded-xl">
                  <Option value="meeting">Họp nhóm</Option>
                  <Option value="study">Học nhóm</Option>
                  <Option value="presentation">Thuyết trình</Option>
                  <Option value="exam">Kiểm tra</Option>
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <Form.Item
                name="eventDate"
                label={<span className="text-gray-700 font-medium">Ngày</span>}
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              >
                <DatePicker
                  className="w-full rounded-xl"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>

              <Form.Item
                name="timeRange"
                label={<span className="text-gray-700 font-medium">Thời gian</span>}
                rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
              >
                <TimePicker.RangePicker
                  format="HH:mm"
                  className="w-full rounded-xl"
                  placeholder={["Bắt đầu", "Kết thúc"]}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="participants"
              label={<span className="text-gray-700 font-medium">Thành viên tham gia</span>}
            >
              {groupMembers && groupMembers.length > 0 ? (
                <Select
                  mode="multiple"
                  placeholder="Chọn thành viên tham gia"
                  optionFilterProp="label"
                  className="rounded-xl"
                  showSearch
                >
                  {groupMembers.map(member => (
                    <Option key={member.userId} value={member.userId} label={member.name}>
                      <div className="flex items-center gap-2">
                        <div className={`${member.color} w-6 h-6 rounded-full flex items-center justify-center text-white text-xs`}>{member.avatar}</div>
                        <span>{member.name}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input
                  placeholder="Nhập tên thành viên, cách nhau bởi dấu phẩy"
                  prefix={<TeamOutlined className="text-gray-400" />}
                  className="rounded-xl"
                />
              )}
            </Form.Item>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
                className="flex-1 h-12 rounded-xl"
                size="large"
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 border-0 rounded-xl"
                size="large"
              >
                Tạo sự kiện
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
      {/* Event Detail Modal */}
      <Modal
        title={null}
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        footer={null}
        width={650}
        centered
        destroyOnClose
        className="rounded-lg overflow-hidden"
      >
        {selectedEvent && (
          <div className="px-6 py-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold">
                  {selectedEvent.title ? (selectedEvent.title[0] || 'E').toUpperCase() : 'E'}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{selectedEvent.title}</div>
                  <div className="mt-1 text-sm text-gray-500">{selectedEvent.groupName || 'Nhóm không xác định'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{selectedEvent.startIso ? dayjs(selectedEvent.startIso).format('DD/MM/YYYY') : ''}</div>
                <div className="text-xs text-gray-400">{selectedEvent.startIso ? dayjs(selectedEvent.startIso).format('HH:mm') : ''} — {selectedEvent.endIso ? dayjs(selectedEvent.endIso).format('HH:mm') : ''}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              {/* Description card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Mô tả</div>
                <div className="text-gray-800">{selectedEvent.description || <span className="text-gray-400">Không có mô tả</span>}</div>
              </div>

              {/* Participants */}
              <div>
                <div className="text-sm text-gray-600 mb-3">Thành viên ({(selectedEvent.displayParticipants || selectedEvent.participants || []).length})</div>
                <div className="flex flex-wrap gap-3">
                  {(selectedEvent.displayParticipants && selectedEvent.displayParticipants.length > 0 ? selectedEvent.displayParticipants : selectedEvent.participants || []).map((p, idx) => {
                    const name = typeof p === 'string' ? p : (p.name || p.username || String(p));
                    const initials = name ? name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() : 'U';
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium text-sm">{initials}</div>
                        <div className="text-sm text-gray-800">{name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Popconfirm
                title={"Bạn có chắc muốn xóa sự kiện này? Hành động không thể hoàn tác."}
                okText="Xóa"
                okType="danger"
                cancelText="Hủy"
                onConfirm={() => handleDeleteEvent(selectedEvent)}
                getPopupContainer={() => document.body}
              >
                <Button danger>Xóa</Button>
              </Popconfirm>
              <Button
                type="default"
                onClick={() => { setIsDetailModalOpen(false); setSelectedEvent(null); }}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
      </div>

    </>
  );
}