/**
 * Composable for calendar integration utilities
 * Generates links and files for various calendar services
 */

export function useCalendar() {
  /**
   * Format date for calendar services
   */
  const formatDateForCalendar = (date) => {
    return new Date(date)
      .toISOString()
      .replace(/-|:|\.\d+/g, '')
  }

  /**
   * Escape special characters for calendar text fields
   */
  const escapeCalendarText = (text) => {
    return text.replace(/[,;\\]/g, '\\$&')
  }

  /**
   * Generate Google Calendar URL
   */
  const getGoogleCalendarUrl = (event) => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.name,
      details: event.description,
      dates: `${formatDateForCalendar(event.startDate)}/${formatDateForCalendar(event.endDate)}`,
      location: event.location || '',
      ctz: 'America/Lima'
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  /**
   * Generate Outlook Calendar URL
   */
  const getOutlookCalendarUrl = (event) => {
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.name,
      body: event.description,
      startdt: new Date(event.startDate).toISOString(),
      enddt: new Date(event.endDate).toISOString(),
      location: event.location || ''
    })

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
  }

  /**
   * Generate Yahoo Calendar URL
   */
  const getYahooCalendarUrl = (event) => {
    const duration = Math.floor(
      (new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60)
    )

    const params = new URLSearchParams({
      v: '60',
      view: 'd',
      type: '20',
      title: event.name,
      st: formatDateForCalendar(event.startDate),
      dur: duration.toString(),
      desc: event.description,
      in_loc: event.location || ''
    })

    return `https://calendar.yahoo.com/?${params.toString()}`
  }

  /**
   * Generate iCal file content
   */
  const generateICalContent = (event) => {
    const now = formatDateForCalendar(new Date())
    const start = formatDateForCalendar(event.startDate)
    const end = formatDateForCalendar(event.endDate)

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MiniFeria//Event Calendar//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id || event.slug}@miniferias.pe`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeCalendarText(event.name)}`,
      `DESCRIPTION:${escapeCalendarText(event.description)}`,
      event.location ? `LOCATION:${escapeCalendarText(event.location)}` : '',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n')
  }

  /**
   * Download iCal file
   */
  const downloadICalFile = (event) => {
    const content = generateICalContent(event)
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${event.slug || 'event'}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  /**
   * Get all calendar options
   */
  const getCalendarOptions = (event) => {
    return [
      {
        name: 'Google Calendar',
        icon: '📅',
        action: () => window.open(getGoogleCalendarUrl(event), '_blank')
      },
      {
        name: 'Outlook',
        icon: '📆',
        action: () => window.open(getOutlookCalendarUrl(event), '_blank')
      },
      {
        name: 'Yahoo Calendar',
        icon: '📋',
        action: () => window.open(getYahooCalendarUrl(event), '_blank')
      },
      {
        name: 'iCal / Apple',
        icon: '🍎',
        action: () => downloadICalFile(event)
      }
    ]
  }

  return {
    getGoogleCalendarUrl,
    getOutlookCalendarUrl,
    getYahooCalendarUrl,
    generateICalContent,
    downloadICalFile,
    getCalendarOptions
  }
}
