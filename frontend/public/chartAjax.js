// Changelog: humanData -> Human
var humanData = [
    {
	label: 'human Chain Correct',
	value: 5,
	color: '#174D6B'
    },
    {
	label: 'human Chain Incorrect',
	value: 5,
	color: '#91C6B2'
    }
];
// Changelog: rnn -> rnn
var rnnData = [
    {
	label: 'RNN Correct',
	value: 5,
	color: '#174D6B'
    },
    {
	label: 'RNN Incorrect',
	value: 5,
	color: '#91C6B2'
    }
];
var humanChart;
var rnnChart;
$(document).ready(function()
		  {
		      //alert("document ready");
		      var humanContext = document.getElementById('human').getContext('2d');
		      humanChart = new Chart(humanContext).Pie(humanData);
		      var rnnContext = document.getElementById('rnn').getContext('2d');
		      rnnChart = new Chart(rnnContext).Pie(rnnData);
		      getTotals();

		      setInterval(function(){
			  getTotals();
		      }, 1000);
		  })
function getTotals() {
    $.ajax({url: "/eap/chartInfo", success: function(result){
	//alert(result.humanRight);
	if (humanChart.segments[0].value != result.humanRight || humanChart.segments[1].value != (result.humanTotal - result.humanRight))
	{
	    humanChart.segments[0].value = result.humanRight;
	    humanChart.segments[1].value = result.humanTotal-result.humanRight;
	    humanChart.update();
	}
	if (rnnChart.segments[0].value != result.rnnRight || rnnChart.segments[1].value != (result.rnnTotal - result.rnnRight)) {
	    rnnChart.segments[0].value = result.rnnRight;
	    rnnChart.segments[1].value = result.rnnTotal-result.rnnRight;
	    rnnChart.update();
	}


	console.log(JSON.stringify(result));
	$("#humanP").text(100-(~~((result.humanRight / result.humanTotal)*100)) + "%");
	
	$("#rnnP").text(100-(~~((result.rnnRight / result.rnnTotal)*100)) + "%");



    }});

}
