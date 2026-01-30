<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class RadiusCoAService
{
    private string $secret;
    private string $host;
    private int $port;

    public function __construct()
    {
        $this->secret = config('services.radius.coa_secret', 'testing123');
        $this->host = config('services.radius.coa_host', '127.0.0.1');
        $this->port = config('services.radius.coa_port', 3799);
    }

    public function sendDisconnectRequest(string $sessionId, string $username, string $mac, string $ip): bool
    {
        try {
            // Prepare CoA packet
            $packet = [
                "Acct-Session-Id" => $sessionId,
                "User-Name" => $username,
                "Calling-Station-Id" => $mac,
                "Framed-IP-Address" => $ip,
                "Event-Timestamp" => time(),
                "Acct-Terminate-Cause" => "Session-Timeout"
            ];

            // Format as radius packet
            $radiusPacket = $this->formatRadiusPacket($packet);

            // Send via radclient (using exec)
            $command = sprintf(
                'echo "%s" | radclient -x %s:%d disconnect %s 2>&1',
                $radiusPacket,
                escapeshellarg($this->host),
                $this->port,
                escapeshellarg($this->secret)
            );

            exec($command, $output, $returnCode);

            $success = $returnCode === 0;

            Log::info('CoA Disconnect Request', [
                'session_id' => $sessionId,
                'username' => $username,
                'mac' => $mac,
                'ip' => $ip,
                'command' => $command,
                'output' => $output,
                'return_code' => $returnCode,
                'success' => $success
            ]);

            return $success;

        } catch (\Throwable $e) {
            Log::error('CoA Disconnect Failed', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    private function formatRadiusPacket(array $attributes): string
    {
        $lines = [];
        foreach ($attributes as $key => $value) {
            $lines[] = sprintf('%s = "%s"', $key, addslashes($value));
        }
        return implode("\n", $lines);
    }

    public function sendCoAtoAirtelCPE(string $sessionId, string $mac, string $ip): bool
    {
        // Airtel CPE specific CoA (if different from standard)
        // This can be customized based on CPE model
        $packet = [
            "Acct-Session-Id" => $sessionId,
            "Calling-Station-Id" => $mac,
            "Framed-IP-Address" => $ip,
            "Airtel-Force-Disconnect" => "1",
            "Airtel-Session-End" => "timeout"
        ];

        return $this->sendDisconnectRequest($sessionId, 'airtel-' . $mac, $mac, $ip);
    }
}