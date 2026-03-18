const url = 'https://xdmbcbdjirnhwsqbjbux.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbWJjYmRqaXJuaHdzcWJqYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTY2ODgsImV4cCI6MjA4MzE5MjY4OH0.xYnN6ziiHrihDq1QG3CbfSkxNkA_kbfeO-E-yFkoCjU';

fetch(url)
  .then(res => res.json())
  .then(json => {
    const table = json.definitions['exam_results'];
    console.log(JSON.stringify(table, null, 2));
  });
