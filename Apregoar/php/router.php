<?php
 require('config.php');

 class BogusAction {
    public $action;
    public $method;
    public $data;
    public $tid;
 }

 $isForm = false;
 $isUpload = false;

 if (isset($HTTP_RAW_POST_DATA)) {
    header('Content-Type: text/javascript');
    $data = json_decode($HTTP_RAW_POST_DATA);
 }
 else if(isset($_POST['extAction'])){ // form post
    $isForm = true;
    $isUpload = $_POST['extUpload'] == 'true';
    $data = new BogusAction();
    $data->action = $_POST['extAction'];
    $data->method = $_POST['extMethod'];
    $data->tid = isset($_POST['extTID']) ? $_POST['extTID'] : null;
    $data->data = array($_POST, $_FILES);
 }
 else {
    die('Invalid request.');
 }

 function doRpc($cdata){
    $API = get_extdirect_api('router');

    try {
        if (!isset($API[$cdata->action])) {
            throw new Exception('Call to undefined action: ' . $cdata->action);
        }

        $action = $cdata->action;
        $a = $API[$action];

        $method = $cdata->method;
        $mdef = $a['methods'][$method];

        if (!$mdef){
            throw new Exception("Call to undefined method: $method " .
                                "in action $action");
        }

        $r = array(
            'type'=>'rpc',
            'tid'=>$cdata->tid,
            'action'=>$action,
            'method'=>$method
        );

        require_once("classes/$action.php");
        $o = new $action();

        if (isset($mdef['len'])) {
            $params = isset($cdata->data) && is_array($cdata->data) ? $cdata->data : array();
        }
 else {
            $params = array($cdata->data);
        }

        array_push($params, $cdata->metadata);

        $r['result'] = call_user_func_array(array($o, $method), $params);
    }

    catch(Exception $e){
        $r['type'] = 'exception';
        $r['message'] = $e->getMessage();
        $r['where'] = $e->getTraceAsString();
    }

    return $r;
 }

 $response = null;

 if (is_array($data)) {
    $response = array();
    foreach($data as $d){
        $response[] = doRpc($d);
    }
 }
 else{
    $response = doRpc($data);
 }

 if ($isForm && $isUpload){
    echo '<html><body><textarea>';
    echo json_encode($response);
    echo '</textarea></body></html>';
 }
 else{
    echo json_encode($response);
 }

 // https://docs.sencha.com/extjs/6.2.0/guides/backend_connectors/direct/mysql_php.html