import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Chart } from 'chart.js/auto';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

function MonthlyTotalChart({ monthlyTotal }) {
  const chartRef = useRef(null);
  let chartInstance = null;

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Monthly Total Expenses',
            data: monthlyTotal,
            backgroundColor: 'rgba(195,180,243,255)',
            borderColor: 'rgba(72,38,185,255)',
            borderWidth: 1
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 500
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [monthlyTotal]);

  return (
    <div className="my-4">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

function App() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showInput, setShowInput] = useState(false);

  function openShowInput() {
    setShowInput(true);
  }

  function closeShowInput() {
    setShowInput(false);
  }

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newExpense = {
      title: title,
      amount: amount,
      date: date,
    };

    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
    setTitle('');
    setAmount('');
    setDate('');
  };

  const handleYearFilter = (event) => {
    const selectedYear = event.target.value;
    setSelectedYear(selectedYear);

    const filteredExpenses = expenses.filter(
      (expense) => expense.date.split('-')[0] === selectedYear
    );

    setFilteredExpenses(filteredExpenses);
  };

  const getMonthlyTotal = (year) => {
    const filteredExpenses = expenses.filter(
      (expense) => expense.date.split('-')[0] === year
    );

    const monthlyTotal = Array.from({ length: 12 }, () => 0);

    filteredExpenses.forEach((expense) => {
      const month = Number(expense.date.split('-')[1]);
      monthlyTotal[month - 1] += Number(expense.amount);
    });

    return monthlyTotal;
  };

  const groupExpensesByMonth = (expenses) => {
    const groupedExpenses = {};

    expenses.forEach((expense) => {
      const date = parseISO(expense.date);
      const month = format(date, 'MMMM yyyy', { locale: enUS });

      if (!groupedExpenses[month]) {
        groupedExpenses[month] = [];
      }

      groupedExpenses[month].push(expense);
    });

    return groupedExpenses;
  };

  const renderExpensesByMonth = (expensesByMonth) => {
    return Object.entries(expensesByMonth).map(([month, expenses]) => (
      <div key={month}>
        {expenses.map((expense, index) => (
          <div key={index} className="">
            <div className="row DisplayContainer align-items-center">
              <div className="col-sm-2 align-self-center DateBlock">
                  {format(parseISO(expense.date), 'dd MMM yyyy')}
              </div>
              <div className="col align-self-center">
                  <b>{expense.title}  </b>
              </div>
              <div className="col align-self-center AmountBlock">
                ${expense.amount}
              </div>
              <div class="w-100 d-none d-md-block"></div>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="App">
      <div className="">
        {showInput === false && (
          <div className="InputContainer">
            <div className="FlexCenter">
              <button className="ExpenseBTN" onClick={openShowInput}>
                Add New Expense
              </button>
            </div>
          </div>
        )}

        {showInput === true && (
          <div className="InputContainer">
            <form onSubmit={handleSubmit} className="my-2">
              <div className="row">
                <div className="col">
                  <label htmlFor="title" className="form-label text-body fw-bold">
                    Title:
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="form-control"
                    value={title}
                    onChange={handleTitleChange}
                    required
                  />
                </div>
                <div className="col">
                  <label htmlFor="amount" className="form-label text-body fw-bold">
                    Amount:
                  </label>
                  <input
                    type="number"
                    id="amount"
                    className="form-control"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                  />
                </div>
                <div className="col-1" />
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="date" className="form-label text-body fw-bold">
                    Date:
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="form-control"
                    value={date}
                    onChange={handleDateChange}
                    required
                  />
                </div>
                <div className="col" />
                <div className="col-1" />
              </div>
              <div className="FlexEnd">
                <button className="ExpenseBTN" onClick={closeShowInput}>
                  Cancel
                </button>
                <button type="submit" className="ExpenseBTN">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="FilterYear">
          <div className="row">
            <div className="col">
              <div className="FilterYearTest">Filter by year</div>
            </div>
            <div className="col">
              <div className="FlexEnd">
                <select
                  value={selectedYear}
                  onChange={handleYearFilter}
                  className="FilterYearSLCT"
                >
                  <option value="">Select Year</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>
          </div>

          {selectedYear !== '' ? (
            <MonthlyTotalChart monthlyTotal={getMonthlyTotal(selectedYear)} />
          ) : (
            <div>Please select a year to view the monthly total expenses.</div>
          )}

          <div>
            <div>
              {filteredExpenses.length > 0 ? (
                renderExpensesByMonth(groupExpensesByMonth(filteredExpenses))
              ) : (
                <div className="FlexCenter">
                  <h4>Found no expenses.</h4>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;