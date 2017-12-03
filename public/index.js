$(function() {

    // Chart ages
    function ages(results) {
        // Collect age results
        var data = {};
        for (var i = 0, l = results.length; i<l; i++) {
            var ageResponse = results[i].responses[0];
            var k = String(ageResponse.answer);
            if (!data[k]) data[k] = 1;
            else data[k]++;
        }

        // Assemble for graph
        var labels = Object.keys(data);
        var dataSet = [];
        for (var k in data)
            dataSet.push(data[k]);

        // Render chart
        var ctx = document.getElementById('ageChart').getContext('2d');
        var ageChart = new Chart(ctx).Bar({
            labels: labels,
            datasets: [
                {
                    label: 'Ages',
                    data: dataSet
                }
            ]
        });
    }

    // Chart yes/no responses to lemur question
    function lemurs(results) {
        // Collect lemur kicking results
        var yes = 0, no = 0;
        for (var i = 0, l = results.length; i<l; i++) {
            var lemurResponse = results[i].responses[1];
            lemurResponse.answer ? yes++ : no++;
        }

        var ctx = document.getElementById('lemurChart').getContext('2d');
        var ageChart = new Chart(ctx).Pie([
            { value: yes, label: 'Yes', color: 'green', highlight: 'gray' },
            { value: no, label: 'No', color: 'red', highlight: 'gray' }
        ]);
    }

    // poor man's html template for a response table row
    function row(data,caller) {
        var response = jQuery.parseJSON(JSON.stringify(data));
      
        
        var tpl = '<tr><td>';
         tpl += caller + '</td><td>';
        tpl += (response.answer ? response.answer : 'NA') + '</td><td>';
        if (response.recordingUrl) {
            tpl += '<a target="_blank" href="'
                + response.recordingUrl 
                + '"><i class="fa fa-play"></i></a></td><td>';
        } else {
            tpl += 'N/A</td><td>';
        }
       /* tpl += (response.googleanswer[0].results[0] ? response.googleanswer[0].results[0].alternatives[0].transcript : 'NA') + '</td><td>';
        tpl += (response.googleanswer[0].results[0] ? response.googleanswer[0].results[0].alternatives[0].confidence : 'NA') + '</td><td>';
        if (response.gcloudObj) {
            tpl += '<a target="_blank" href="'
                + response.gcloudObj 
                + '"><i class="fa fa-play"></i></a></td><td>';
        } else {
            tpl += 'N/A</td>';
        }*/
        if(response.TxHash){
            tpl += '<td>'+response.TxHash+'</td>';
           var ac1 =  $('#acc1').html();
           var ac2 =  $('#acc2').html();
           $('#acc1').html(parseInt(ac1)-1);
           $('#acc2').html(parseInt(ac2)+1);

        }

        tpl += '</tr>';
        return tpl;
    }

    // add text responses to a table
    function freeText(results) {
        var $responses = $('#turtleResponses');
       
        for (var i = 0, l = results.length; i<l; i++) {
            // for each question inside the response print the result to UI
            for(var j = 0; j < results[i].responses.length; j++){
                     var content = '';
                    var turtleResponse = results[i].responses[j];
                    content = row(turtleResponse,results[i].phone);
                    
                switch (j+1) {
                    case 1:
                        $('#responses1').append(content)
                        break;
                    case 2:
                        $('#responses2').append(content)
                        break;
                    case 3:
                        $('#responses3').append(content)
                         // get the first 2 ethereum addresses and their balances

                        break;
                    default:
                        break;
                }
            }
            
        }
        //$responses.append(content);
    }

    // Load current results from server
    $.ajax({
        url: '/results',
        method: 'GET'
    }).done(function(data) {
        // Update charts and tables
        $('#total').html(data.results.length);
       // lemurs(data.results);
        //ages(data.results);
        freeText(data.results);
        console.log('Account balances - '+data.accounts)
        var temp
        for(var i=0;i<data.accounts.length;i++){
            temp += '<td>'+data.accounts[i]+'</td';
        }
        var row = '<tr>' + temp + '</td>'
        $('#responses4').append(row)
    }).fail(function(err) {
        console.log(err);
        alert('failed to load results data :(');
    });
});